import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../components/Frame';
import { Text } from '../components/Text';
import { FnValue } from '../components/values/FnValue';
import { PrimitiveValue } from '../components/values/PrimitiveValue';
import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { 
  defaultActiveColor, 
  defaultBackgroundColor, 
  defaultStrokeColor} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedFnObject } from './base/AnimatedFnObject';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
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

  constructor(changedFramePairs: Frame[][]) {
    super();

    // changedTextPairs only account for binding keys and text values
    const changedTextPairs: Text[][] = [];
    const changedFnPairs: FnValue[][] = [];

    // FRAMES
    this.frameAnimations = [];
    this.newFrameCovers = [];
    for (const framePair of changedFramePairs) {
      const oldFramePosition = getNodePosition(framePair[0]);
      this.frameAnimations.push(
        new AnimatedRectComponent({
          ...oldFramePosition,
          cornerRadius: Config.FrameCornerRadius,
          stroke: CseMachine.getCurrentEnvId() != null && 
                  framePair[0].environment?.id === CseMachine.getCurrentEnvId()
                    ? defaultActiveColor() : defaultStrokeColor()
        })
      )
      const newFramePosition = getNodePosition(framePair[1]);
      this.newFrameCovers.push(
        new AnimatedRectComponent({
          ...newFramePosition,
          cornerRadius: Config.FrameCornerRadius,
          stroke: defaultBackgroundColor(),
          strokeWidth: 4
        })
      )

      // Set up changedTextPairs
      const oldBindings = framePair[0].bindings;
      const newBindings = framePair[1].bindings;
      for (let i = 0; i < oldBindings.length; i++) {
        if (oldBindings[i].isDummyBinding == false) { 
          changedTextPairs.push([oldBindings[i].key, newBindings[i].key]);

          // Create animations for primitive text values 
          if (oldBindings[i].value instanceof PrimitiveValue) {
            const oldValue: PrimitiveValue = oldBindings[i].value as PrimitiveValue;
            const newValue: PrimitiveValue = newBindings[i].value as PrimitiveValue;
            if (oldValue.text instanceof Text) {
              changedTextPairs.push([(oldValue.text as Text), (newValue.text as Text)])
            }
          }
        }

        // Create animations for FnValue, even if is dummy binding
        if (oldBindings[i].value instanceof FnValue) {
          const oldFn: FnValue = oldBindings[i].value as FnValue;
          const newFn: FnValue = newBindings[i].value as FnValue;
          changedFnPairs.push([oldFn, newFn]);
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
          text: textPair[0].fullStr
        })
      );
      const newTextPosition = getNodePosition(textPair[1]);
      this.newTextCovers.push(
        new AnimatedTextComponent({
          ...newTextPosition,
          text: textPair[1].fullStr,
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
        new AnimatedFnObject(fnPair[1], {
          ...newFnPosition,
        }, true)
      )
    }
  }

  // Covers must be written on an earlier line than their animations
  // so that the animation is rendered over the cover
  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.newFrameCovers.map((rect) => rect.draw())}
        {this.frameAnimations.map((rect) => rect.draw())}
        {this.newTextCovers.map((rect) => rect.draw())}
        {this.textAnimations.map((rect) => rect.draw())}
        {this.newFnCovers.map((rect) => rect.draw())}
        {this.fnAnimations.map((rect) => rect.draw())}
      </Group>
    );
  }

  async animate() {
    // FRAMES
    for (let frameIdx = 0; frameIdx < this.frameAnimations.length; frameIdx++) {
      const newFramePosition = getNodePosition(this.newFrameCovers[frameIdx]);
      this.frameAnimations[frameIdx].animateTo({
        x: newFramePosition.x, y: newFramePosition.y
      }, { duration: 2 })
    }
    // TEXTS
    for (let textIdx = 0; textIdx < this.textAnimations.length; textIdx++) {
      const newTextPosition = getNodePosition(this.newTextCovers[textIdx]);
      this.textAnimations[textIdx].animateTo({
        x: newTextPosition.x, y: newTextPosition.y
      }, { duration: 2 })
    }
    // FN OBJECTS
    for (let fnIdx = 0; fnIdx < this.fnAnimations.length; fnIdx++) {
      const newFnPosition = getNodePosition(this.newFnCovers[fnIdx]);
      if (fnIdx == this.fnAnimations.length - 1) { // last animation, await
        await this.fnAnimations[fnIdx].animateTo({
          x: newFnPosition.x, y: newFnPosition.y
        }, { duration: 2 })
      } else {
        this.fnAnimations[fnIdx].animateTo({
          x: newFnPosition.x, y: newFnPosition.y
        }, { duration: 2 })
      }
    }
    this.destroy()
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
    for (const fnCover of this.fnAnimations) {
        fnCover.destroy();
    }
  }
}
