import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../components/Frame';
import { Text } from '../components/Text';
import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { 
  defaultActiveColor, 
  defaultBackgroundColor, 
  defaultStrokeColor} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
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

  constructor(changedFramePairs: Frame[][]) {
    super();

    // changedTextPairs only account for binding keys, not values YET
    const changedTextPairs: Text[][] = [];

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

      // Set up changedTextPairs (only keys for now)
      const oldBindings = framePair[0].bindings;
      const newBindings = framePair[1].bindings;
      for (let i = 0; i < oldBindings.length; i++) {
        changedTextPairs.push([oldBindings[i].key, newBindings[i].key]);
        console.log(oldBindings[i].key);
        console.log(newBindings[i].key);
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
      )
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
      if (textIdx == this.textAnimations.length - 1) { // last animation, await
        await this.textAnimations[textIdx].animateTo({
          x: newTextPosition.x, y: newTextPosition.y
        }, { duration: 2 })
      } else {
        this.textAnimations[textIdx].animateTo({
          x: newTextPosition.x, y: newTextPosition.y
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
  }
}
