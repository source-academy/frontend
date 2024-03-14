import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../compactComponents/Frame';
import { Config } from '../CseMachineConfig';
import { currentItemSAColor } from '../CseMachineUtils';
import { Animatable, AnimatedRectComponent } from './AnimationComponents';
import { getNodePosition } from './AnimationUtils';

export class EnvironmentAnimation extends Animatable {
  private frameAnimation: AnimatedRectComponent;
  private tempRect: AnimatedRectComponent; // this one just hides the blue temporarily

  constructor(
    prevFrame: Frame,
    private currFrame: Frame
  ) {
    super();
    const currFramePosition = getNodePosition(currFrame);
    this.tempRect = new AnimatedRectComponent({
      ...currFramePosition,
      cornerRadius: Number(Config.FrameCornerRadius)
    });
    const prevFramePosition = getNodePosition(prevFrame);
    this.frameAnimation = new AnimatedRectComponent(
      {
        ...prevFramePosition,
        cornerRadius: Number(Config.FrameCornerRadius),
        stroke: currentItemSAColor(true)
      },
      undefined
    );
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.tempRect.draw()}
        {this.frameAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    const oldPosition = getNodePosition(this.frameAnimation);
    const strokeWidth: number = this.currFrame.ref.current?.strokeWidth() ?? 2;
    const strokeIncrease = 4;
    // increase frame border width
    await this.frameAnimation.animateTo({
      x: oldPosition.x - strokeIncrease / 2,
      y: oldPosition.y - strokeIncrease / 2,
      height: oldPosition.height + strokeIncrease,
      width: oldPosition.width + strokeIncrease,
      strokeWidth: strokeWidth + strokeIncrease
    });
    // move frame border to correct position
    const newPosition = getNodePosition(this.currFrame);
    await this.frameAnimation.animateTo(
      {
        x: newPosition.x - strokeIncrease / 2,
        y: newPosition.y - strokeIncrease / 2,
        height: newPosition.height + strokeIncrease,
        width: newPosition.width + strokeIncrease
      },
      { durationMultiplier: 1.5 }
    );
    this.tempRect.ref.current?.hide();
    await this.frameAnimation.animateTo({ ...newPosition, strokeWidth }, { durationMultiplier: 1 });
    this.currFrame.ref.current?.stroke(currentItemSAColor(true));
    this.frameAnimation.ref.current?.hide();
  }

  destroy() {
    this.frameAnimation.destroy();
    this.tempRect.destroy();
  }
}
