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

    // changedTextPairs only account for binding keys and text values
    const changedTextPairs: Text[][] = [];
    const changedFnPairs: Array<[FnValue | GlobalFnValue, FnValue | GlobalFnValue]> = [];

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
          changedTextPairs.push([oldBinding.key, newBinding.key]);

          // Create animations for primitive text values
          if (
            oldBinding.value instanceof PrimitiveValue &&
            newBinding.value instanceof PrimitiveValue
          ) {
            const oldValue: PrimitiveValue = oldBinding.value as PrimitiveValue;
            const newValue: PrimitiveValue = newBinding.value as PrimitiveValue;
            if (oldValue.text instanceof Text) {
              changedTextPairs.push([oldValue.text as Text, newValue.text as Text]);
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
          if (oldFnVisible) {
            changedFnPairs.push([oldFn, newBinding.value]);
          }
        }

        // Create animations for ArrayValue, even if is dummy binding
        if (oldBinding.value instanceof ArrayValue && newBinding.value instanceof ArrayValue) {
          const oldArr: ArrayValue = oldBinding.value as ArrayValue;
          if (oldArr.isLive()) {
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
                changedFnPairs
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
      const oldTextPosition = getNodePosition(textPair[0]);
      this.textAnimations.push(
        new AnimatedTextComponent({
          ...oldTextPosition,
          text: textPair[0].partialStr
        })
      );
      const newTextPosition = getNodePosition(textPair[1]);
      this.newTextCovers.push(
        new AnimatedTextComponent({
          ...newTextPosition,
          text: textPair[1].partialStr,
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
    changedTextPairs: Text[][],
    changedFnPairs: Array<[FnValue | GlobalFnValue, FnValue | GlobalFnValue]>
  ): void {
    // Check each ArrayUnit, add them accordingly
    for (let unitIdx = 0; unitIdx < oldArr.units.length; unitIdx++) {
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
          // TODO: text is a bit misaligned for some reason, including cover text
          changedTextPairs.push([oldValue.text as Text, newValue.text as Text]);
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
        changedFnPairs.push([oldUnit.value as FnValue, newUnit.value as FnValue]);
      } else if (oldUnit.value instanceof ArrayValue) {
        this.recurseInArray(
          oldUnit.value as ArrayValue,
          newUnit.value as ArrayValue,
          changedFramePairs,
          changedTextPairs,
          changedFnPairs
        );
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
