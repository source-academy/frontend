import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../components/Frame';
import { Config } from '../CseMachineConfig';
import { defaultActiveColor, defaultStrokeColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedRectComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';
import CseMachine from '../CseMachine';

/**
 * Animation after clicking "Clear Dead Frames"
 * Shifts frames to close gaps
 */
export class ClearDeadFramesAnimation extends Animatable {
    private frameAnimations: AnimatedRectComponent[];
    private newFrames: Frame[];
    // private newFrameCovers: AnimatedRectComponent[];

  constructor(changedFramePairs: Frame[][]) {
    super();
    this.frameAnimations = [];
    this.newFrames = [];
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
        this.newFrames.push(framePair[1]);
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.frameAnimations.map((rect) => rect.draw())}
      </Group>
    );
  }

  async animate() {
    for (let frameIdx = 0; frameIdx < this.frameAnimations.length; frameIdx++) {
        const newFramePosition = getNodePosition(this.newFrames[frameIdx]);
        if (frameIdx == this.frameAnimations.length - 1) {
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
    // move frame border to correct position
    // const newPosition = getNodePosition(this.currFrame);
    // await this.frameAnimation.animateTo(
    //   {
    //     x: newPosition.x - strokeIncrease / 2,
    //     y: newPosition.y - strokeIncrease / 2,
    //     height: newPosition.height + strokeIncrease,
    //     width: newPosition.width + strokeIncrease
    //   },
    //   { duration: 1.2 }
    // );
    // this.tempRect.ref.current?.hide();
    // await this.frameAnimation.animateTo({ ...newPosition, strokeWidth }, { duration: 1 });
    // this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    for (const frameAnim of this.frameAnimations) {
        frameAnim.destroy();
    }
    // this.frameAnimation.destroy();
    // this.tempRect.destroy();
  }
}
