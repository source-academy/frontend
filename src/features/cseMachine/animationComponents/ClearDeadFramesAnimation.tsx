import React from 'react';
import { Group } from 'react-konva';

import { ArrayNullUnit } from '../components/ArrayNullUnit';
import { ArrayUnit } from '../components/ArrayUnit';
import { Binding } from '../components/Binding';
import { Frame } from '../components/Frame';
import { Text } from '../components/Text';
import { ArrayValue } from '../components/values/ArrayValue';
import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import { PrimitiveValue } from '../components/values/PrimitiveValue';
import CseMachine from '../CseMachine';
import { CseAnimation } from '../CseMachineAnimation';
import { Config } from '../CseMachineConfig';
import { defaultActiveColor, defaultBackgroundColor, defaultStrokeColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedFnObject } from './base/AnimatedFnObject';
import {
  AnimatedLineComponent,
  AnimatedRectComponent,
  AnimatedTextComponent
} from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

/**
 * Animation after clicking "Clear Dead Frames"
 * Shifts frames to close gaps
 */
type AnimatedTextPair = {
  oldText: Text;
  newText: Text;
  targetX: number;
  targetY: number;
};

export class ClearDeadFramesAnimation extends Animatable {
  private frameAnimations: AnimatedRectComponent[];
  private newFrameCovers: AnimatedRectComponent[];

  // Used AnimatedTextComponent instead of AnimatedTextbox because
  // text is stored in each binding rather than an entire frame
  private textAnimations: AnimatedTextComponent[];
  private newTextCovers: AnimatedTextComponent[];

  private fnAnimations: AnimatedFnObject[];
  private newFnCovers: AnimatedFnObject[];

  private lineAnimations: AnimatedLineComponent[] = [];
  private newLineCovers: AnimatedLineComponent[] = [];

  private static getBindingKeyTarget(
    binding: Binding
  ): Pick<AnimatedTextPair, 'targetX' | 'targetY'> {
    return {
      targetX: binding.x(),
      targetY: binding.y() + binding.keyYOffset
    };
  }

  private static getBindingValueTarget(
    binding: Binding,
    value: PrimitiveValue
  ): Pick<AnimatedTextPair, 'targetX' | 'targetY'> {
    if (!(value.text instanceof Text)) {
      return {
        targetX: value.x(),
        targetY: value.y()
      };
    }

    return {
      targetX: binding.x() + binding.key.width() + Config.TextPaddingX,
      targetY: binding.y()
    };
  }

  private static getBindingIdentity(binding: Binding): string {
    if (!binding.isDummyBinding) {
      return `binding:${binding.keyString}`;
    }

    const data = binding.data as { id?: string | number };
    if (data && data.id !== undefined) {
      return `dummy:${String(data.id)}`;
    }

    return `dummy:${binding.keyString}:${typeof binding.data}:${String(binding.data)}`;
  }

  constructor(changedFramePairs: Frame[][]) {
    super();
    CseAnimation.setHideReferenceArrows(true);
    CseAnimation.setHiddenFrameIds(
      changedFramePairs.map(([, newFrame]) => newFrame.environment.id)
    );

    const changedTextPairs: AnimatedTextPair[] = [];
    const changedFnPairs: Array<[FnValue | GlobalFnValue, FnValue | GlobalFnValue]> = [];

    // Account for duplicated fn values and array values
    const visitedFnValues = new Set<FnValue | GlobalFnValue>();
    const visitedArrayValues = new Set<ArrayValue>();

    // FRAMES
    this.frameAnimations = [];
    this.newFrameCovers = [];
    for (const framePair of changedFramePairs) {
      const oldFramePosition = getNodePosition(framePair[0]);
      this.frameAnimations.push(
        new AnimatedRectComponent({
          ...oldFramePosition,
          cornerRadius: Config.FrameCornerRadius,
          stroke:
            CseMachine.getCurrentEnvId() != null &&
            framePair[0].environment?.id === CseMachine.getCurrentEnvId()
              ? defaultActiveColor()
              : defaultStrokeColor()
        })
      );
      const newFramePosition = getNodePosition(framePair[1]);
      this.newFrameCovers.push(
        new AnimatedRectComponent({
          ...newFramePosition,
          cornerRadius: Config.FrameCornerRadius,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          strokeWidth: 4
        })
      );

      changedTextPairs.push({
        oldText: framePair[0].name,
        newText: framePair[1].name,
        targetX: framePair[1].name.x(),
        targetY: framePair[1].name.y()
      });

      // For each binding in this frame
      const oldBindings = framePair[0].bindings;
      const newBindingsByIdentity = new Map(
        framePair[1].bindings.map(binding => [
          ClearDeadFramesAnimation.getBindingIdentity(binding),
          binding
        ])
      );
      for (const oldBinding of oldBindings) {
        const newBinding = newBindingsByIdentity.get(
          ClearDeadFramesAnimation.getBindingIdentity(oldBinding)
        );
        if (!newBinding) {
          continue;
        }

        if (oldBinding.isDummyBinding == false) {
          const keyTarget = ClearDeadFramesAnimation.getBindingKeyTarget(newBinding);
          changedTextPairs.push({
            oldText: oldBinding.key,
            newText: newBinding.key,
            ...keyTarget
          });

          // Create animations for primitive text values
          if (
            oldBinding.value instanceof PrimitiveValue &&
            newBinding.value instanceof PrimitiveValue
          ) {
            const oldValue: PrimitiveValue = oldBinding.value as PrimitiveValue;
            const newValue: PrimitiveValue = newBinding.value as PrimitiveValue;
            if (oldValue.text instanceof Text) {
              const valueTarget = ClearDeadFramesAnimation.getBindingValueTarget(
                newBinding,
                newValue
              );
              changedTextPairs.push({
                oldText: oldValue.text as Text,
                newText: newValue.text as Text,
                ...valueTarget
              });
            }
          }
        }

        // Create animations for function objects, even if is dummy binding
        if (
          (oldBinding.value instanceof FnValue || oldBinding.value instanceof GlobalFnValue) &&
          (newBinding.value instanceof FnValue || newBinding.value instanceof GlobalFnValue)
        ) {
          const oldFn = oldBinding.value;
          const oldFnVisible =
            oldFn instanceof GlobalFnValue ? oldFn.isReferenced() : oldFn.isLive();
          if (oldFnVisible && !visitedFnValues.has(oldFn)) {
            visitedFnValues.add(oldFn);
            changedFnPairs.push([oldFn, newBinding.value]);
          }
        }

        // Create animations for ArrayValue, even if is dummy binding
        if (oldBinding.value instanceof ArrayValue && newBinding.value instanceof ArrayValue) {
          const oldArr: ArrayValue = oldBinding.value as ArrayValue;
          if (oldArr.isLive() && !visitedArrayValues.has(oldArr)) {
            visitedArrayValues.add(oldArr);
            const newArr: ArrayValue = newBinding.value as ArrayValue;

            if (oldArr.units.length == 0) {
              // Only ArrayEmptyUnit
              this.frameAnimations.push(
                new AnimatedRectComponent({
                  ...getNodePosition(oldArr),
                  cornerRadius: 0
                })
              );
              this.newFrameCovers.push(
                new AnimatedRectComponent({
                  ...getNodePosition(newArr),
                  cornerRadius: 0,
                  fill: defaultBackgroundColor(),
                  stroke: defaultBackgroundColor(),
                  strokeWidth: 4
                })
              );
            } else {
              // Has at least one ArrayUnit
              this.recurseInArray(
                oldArr,
                newArr,
                changedFramePairs,
                changedTextPairs,
                changedFnPairs,
                visitedFnValues,
                visitedArrayValues
              );
            }
          }
        }
      }
    }

    // TEXTS
    this.textAnimations = [];
    this.newTextCovers = [];
    for (const textPair of changedTextPairs) {
      const oldTextPosition = getNodePosition(textPair.oldText);
      this.textAnimations.push(
        new AnimatedTextComponent({
          ...oldTextPosition,
          text: textPair.oldText.partialStr
        })
      );
      this.newTextCovers.push(
        new AnimatedTextComponent({
          x: textPair.targetX,
          y: textPair.targetY,
          text: textPair.newText.partialStr,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          strokeWidth: 4 // stroke is required for strokeWidth
        })
      );
    }

    // FN OBJECTS
    this.fnAnimations = [];
    this.newFnCovers = [];
    for (const fnPair of changedFnPairs) {
      const oldFnPosition = getNodePosition(fnPair[0]);
      this.fnAnimations.push(
        new AnimatedFnObject(fnPair[0], {
          ...oldFnPosition
        })
      );
      const newFnPosition = getNodePosition(fnPair[1]);
      this.newFnCovers.push(
        new AnimatedFnObject(
          fnPair[1],
          {
            ...newFnPosition
          },
          true
        )
      );
    }
  }

  // Method for ArrayValues to be used in constructor
  private recurseInArray(
    oldArr: ArrayValue,
    newArr: ArrayValue,
    changedFramePairs: Frame[][],
    changedTextPairs: AnimatedTextPair[],
    changedFnPairs: Array<[FnValue | GlobalFnValue, FnValue | GlobalFnValue]>,
    visitedFnValues: Set<FnValue | GlobalFnValue>,
    visitedArrayValues: Set<ArrayValue>
  ): void {
    // Check each ArrayUnit, add them accordingly
    for (let unitIdx = 0; unitIdx < oldArr.units.length; unitIdx++) {
      if (unitIdx >= newArr.units.length) {
        continue;
      } // Defensive check for out-of-bounds

      const oldUnit: ArrayUnit = oldArr.units[unitIdx];
      const newUnit: ArrayUnit = newArr.units[unitIdx];
      const cornerRadius = [
        // clockwise order
        oldUnit.isFirstUnit ? Config.DataCornerRadius : 0,
        oldUnit.isLastUnit ? Config.DataCornerRadius : 0,
        oldUnit.isLastUnit ? Config.DataCornerRadius : 0,
        oldUnit.isFirstUnit ? Config.DataCornerRadius : 0
      ];

      // Add the border first
      this.frameAnimations.push(
        new AnimatedRectComponent({
          ...getNodePosition(oldUnit),
          cornerRadius: cornerRadius
        })
      );
      this.newFrameCovers.push(
        new AnimatedRectComponent({
          ...getNodePosition(newUnit),
          cornerRadius: cornerRadius,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          strokeWidth: 4
        })
      );

      // Add the value next
      if (oldUnit.value instanceof PrimitiveValue) {
        const oldValue: PrimitiveValue = oldUnit.value as PrimitiveValue;
        const newValue: PrimitiveValue = newUnit.value as PrimitiveValue;
        if (oldValue.text instanceof Text) {
          changedTextPairs.push({
            oldText: oldValue.text as Text,
            newText: newValue.text as Text,
            targetX: newValue.x(),
            targetY: newValue.y()
          });
        } else if (oldValue.text instanceof ArrayNullUnit) {
          let { x, y, height, width } = getNodePosition(oldValue.text as ArrayNullUnit);
          this.lineAnimations.push(
            new AnimatedLineComponent({
              x: x,
              y: y,
              points: [0, height, width, 0]
            })
          );
          ({ x, y, height, width } = getNodePosition(newValue.text as ArrayNullUnit));
          this.newLineCovers.push(
            new AnimatedLineComponent({
              x: x,
              y: y,
              points: [0, height, width, 0],
              stroke: defaultBackgroundColor(),
              strokeWidth: 4
            })
          );
        }
      } else if (oldUnit.value instanceof FnValue) {
        const oldFn = oldUnit.value as FnValue;
        if (!visitedFnValues.has(oldFn)) {
          visitedFnValues.add(oldFn);
          changedFnPairs.push([oldFn, newUnit.value as FnValue]);
        }
      } else if (oldUnit.value instanceof ArrayValue) {
        const oldArr = oldUnit.value as ArrayValue;
        if (!visitedArrayValues.has(oldArr)) {
          visitedArrayValues.add(oldArr);
          this.recurseInArray(
            oldUnit.value as ArrayValue,
            newUnit.value as ArrayValue,
            changedFramePairs,
            changedTextPairs,
            changedFnPairs,
            visitedFnValues,
            visitedArrayValues
          );
        }
      }
    }
  }

  // Covers must be written on an earlier line than their animations
  // so that the animation is rendered over the cover
  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.newLineCovers.map(rect => rect.draw())}
        {this.newFrameCovers.map(rect => rect.draw())}
        {this.newTextCovers.map(rect => rect.draw())}
        {this.newFnCovers.map(rect => rect.draw())}
        {this.lineAnimations.map(rect => rect.draw())}
        {this.frameAnimations.map(rect => rect.draw())}
        {this.textAnimations.map(rect => rect.draw())}
        {this.fnAnimations.map(rect => rect.draw())}
      </Group>
    );
  }

  async animate() {
    const animations: Promise<void>[] = [];

    // FRAMES
    for (let frameIdx = 0; frameIdx < this.frameAnimations.length; frameIdx++) {
      const newFramePosition = getNodePosition(this.newFrameCovers[frameIdx]);
      animations.push(
        this.frameAnimations[frameIdx].animateTo(
          {
            x: newFramePosition.x,
            y: newFramePosition.y
          },
          { duration: 2 }
        )
      );
    }
    // TEXTS
    for (let textIdx = 0; textIdx < this.textAnimations.length; textIdx++) {
      const newTextPosition = getNodePosition(this.newTextCovers[textIdx]);
      animations.push(
        this.textAnimations[textIdx].animateTo(
          {
            x: newTextPosition.x,
            y: newTextPosition.y
          },
          { duration: 2 }
        )
      );
    }
    // ArrayNullUnit's line
    for (let lineIdx = 0; lineIdx < this.lineAnimations.length; lineIdx++) {
      const newLinePosition = getNodePosition(this.newLineCovers[lineIdx]);
      animations.push(
        this.lineAnimations[lineIdx].animateTo(
          {
            x: newLinePosition.x,
            y: newLinePosition.y
          },
          { duration: 2 }
        )
      );
    }
    // FN OBJECTS
    for (let fnIdx = 0; fnIdx < this.fnAnimations.length; fnIdx++) {
      const newFnPosition = getNodePosition(this.newFnCovers[fnIdx]);
      animations.push(
        this.fnAnimations[fnIdx].animateTo(
          {
            x: newFnPosition.x,
            y: newFnPosition.y
          },
          { duration: 2 }
        )
      );
    }
    await Promise.all(animations);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    for (const frameAnim of this.frameAnimations) {
      frameAnim.destroy();
    }
    for (const frameCover of this.newFrameCovers) {
      frameCover.destroy();
    }
    for (const textAnim of this.textAnimations) {
      textAnim.destroy();
    }
    for (const textCover of this.newTextCovers) {
      textCover.destroy();
    }
    for (const fnAnim of this.fnAnimations) {
      fnAnim.destroy();
    }
    for (const fnCover of this.newFnCovers) {
      fnCover.destroy();
    }

    for (const lineAnim of this.lineAnimations) {
      lineAnim.destroy();
    }
    for (const lineCover of this.newLineCovers) {
      lineCover.destroy();
    }

    const animationIdx = CseAnimation.animations.indexOf(this);
    if (animationIdx >= 0) {
      CseAnimation.animations.splice(animationIdx, 1);
    }
    CseAnimation.setHideReferenceArrows(false);
    CseAnimation.clearHiddenFrameIds();
    CseMachine.clearLiveLayouts();
    CseMachine.redraw();
  }
}
