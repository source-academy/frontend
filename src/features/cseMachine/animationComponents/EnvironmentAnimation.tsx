import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../compactComponents/Frame';
import { currentItemSAColor } from '../CseMachineUtils';
import { Animatable, AnimatedRectComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class EnvironmentAnimation extends Animatable {
  private frameAnimation: AnimatedRectComponent;
  private tempRect: AnimatedRectComponent; // this one just hides the blue temporarily

  constructor(
    prevFrame: Frame,
    private currFrame: Frame
  ) {
    super();
    const currFramePosition = getNodePositionFromItem(currFrame);
    this.tempRect = new AnimatedRectComponent(currFramePosition);
    const prevFramePosition = getNodePositionFromItem(prevFrame);
    this.frameAnimation = new AnimatedRectComponent(
      {
        ...prevFramePosition,
        stroke: currentItemSAColor(true)
      },
      undefined,
      { durationMultiplier: 2 }
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
    this.frameAnimation.setDestination({
      strokeWidth: 10
    });
    await Promise.all([this.frameAnimation.animate()]);
    this.frameAnimation.setDestination({
      ...getNodePositionFromItem(this.currFrame)
    });
    await Promise.all([this.frameAnimation.animate()]);
    this.tempRect.ref.current?.hide();
    this.frameAnimation.setDestination({
      strokeWidth: 0
    });
    await Promise.all([this.frameAnimation.animate()]);
  }

  destroy() {
    this.frameAnimation.destroy();
    this.tempRect.destroy();
  }
}
