import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { CompactConfig } from '../CseMachineCompactConfig';
import { Config } from '../CseMachineConfig';
import { Animatable, AnimatedRectComponent } from './AnimationComponents';
import { getNodePosition } from './AnimationUtils';
import { EnvironmentAnimation } from './EnvironmentAnimation';

export class FrameCreationAnimation extends Animatable {
  private tempRect: AnimatedRectComponent; // hide the new frame temporarily
  private frameAnimation: AnimatedRectComponent;
  private envAnimation: EnvironmentAnimation;

  constructor(
    prevFrame: Frame,
    private currFrame: Frame,
    currBlockItem: ControlItemComponent
  ) {
    super();
    this.tempRect = new AnimatedRectComponent({
      ...getNodePosition(currFrame),
      cornerRadius: Number(Config.FrameCornerRadius),
      stroke: CompactConfig.SA_BLUE.toString(),
      strokeWidth: 5,
      fill: CompactConfig.SA_BLUE.toString()
    });
    this.frameAnimation = new AnimatedRectComponent({
      ...getNodePosition(currBlockItem),
      opacity: 0
    })
    this.envAnimation = new EnvironmentAnimation(prevFrame, currFrame);
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.envAnimation.draw()}
        {this.tempRect.draw()}
        {this.frameAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    await this.frameAnimation.animateTo({ opacity: 1 });
    await this.frameAnimation.animateTo({
      ...getNodePosition(this.currFrame),
      cornerRadius: Number(Config.FrameCornerRadius)
    },
    { durationMultiplier: 1.5 }
    );
    await this.tempRect.animateTo({
      opacity: 0
    },
    { durationMultiplier: 1.5 }
    );
    await Promise.all([
      this.envAnimation.animate(),
      this.frameAnimation.animateTo({
        opacity: 0
      },
      { delayMultiplier: 1})
    ]);
  }

  destroy() {
    this.tempRect.destroy();
    this.frameAnimation.destroy();
    this.envAnimation.destroy();
  }
}
