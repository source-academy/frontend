import { Easings } from 'konva/lib/Tween';
import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class PopAnimation extends Animatable {
  private popItemAnimation: AnimatedTextboxComponent;
  private stashItemAnimation: AnimatedTextboxComponent;

  constructor(popItem: ControlItemComponent, stashItem: StashItemComponent) {
    super();
    const popItemPosition = getNodePositionFromItem(popItem);
    const stashItemPosition = getNodePositionFromItem(stashItem);
    // TODO: improve the animation make the travel path an arc
    this.popItemAnimation = new AnimatedTextboxComponent(
      popItemPosition,
      { ...stashItemPosition, opacity: 0 },
      popItem.text
    );
    this.stashItemAnimation = new AnimatedTextboxComponent(
      {
        ...stashItemPosition,
        x: stashItemPosition.x + stashItemPosition.width / 2,
        offsetX: stashItemPosition.width / 2,
        y: stashItemPosition.y + stashItemPosition.height / 2,
        offsetY: stashItemPosition.height / 2
      },
      { scaleX: 0.6, scaleY: 0.6 },
      stashItem.text,
      { delayMultiplier: 0.3 }
    );
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.popItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    await Promise.all([this.popItemAnimation.animate(), this.stashItemAnimation.animate()]);
    this.stashItemAnimation.setDestination(
      { scaleX: 1.1, scaleY: 1.1, opacity: 0 },
      { durationMultiplier: 0.5, easing: Easings.StrongEaseOut }
    );
    await this.stashItemAnimation.animate();
  }

  destroy() {
    this.popItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
