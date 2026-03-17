import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../components/Frame';
import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { 
  defaultActiveColor, 
  defaultStrokeColor,
  defaultBackgroundColor 
} from '../CseMachineUtils';
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

  // Did not use AnimatedTextbox because text in bindings are
  // separate (one in each binding, rather than a collective
  // text for a frame), so it would be more accurate to model
  // text for each binding separately from the frames
  // private textAnimations: AnimatedTextComponent[];
  // private newTextPositions

  constructor(changedFramePairs: Frame[][]) {
    super();

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
          strokeWidth: 4,
        })
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
      </Group>
    );
  }

  async animate() {
    for (let frameIdx = 0; frameIdx < this.frameAnimations.length; frameIdx++) {
      const newFramePosition = getNodePosition(this.newFrameCovers[frameIdx]);
      if (frameIdx == this.frameAnimations.length - 1) { // last animation, await
        await this.frameAnimations[frameIdx].animateTo({
          x: newFramePosition.x, y: newFramePosition.y
        }, { duration: 2 })
      } else {
        this.frameAnimations[frameIdx].animateTo({
          x: newFramePosition.x, y: newFramePosition.y
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
  }
}
