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

  constructor(
    private popItem: ControlItemComponent,
    private stashItem: StashItemComponent,
  ) {
    super();
    const popItemPosition = getNodePositionFromItem(popItem);
    const stashItemPosition = getNodePositionFromItem(stashItem);
    // TODO: make the travel path an arc instead of a straight line
    this.popItemAnimation = new AnimatedTextboxComponent(
      popItemPosition,
      { ...stashItemPosition, y: popItem.y() },
      popItem.text,
    );
    this.stashItemAnimation = new AnimatedTextboxComponent(
      stashItemPosition,
      { ...stashItemPosition, y: stashItemPosition.y - stashItem.height(), opacity: 0},
      stashItem.text,
      { easing: Easings.StrongEaseOut }
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
    await Promise.all([this.popItemAnimation.animate()]);
    this.popItemAnimation.setDestination({
      y: this.popItem.y() + this.popItem.height()
    });
    await Promise.all([this.popItemAnimation.animate()]);
    this.popItemAnimation.setDestination({
      y: this.stashItem.y() + this.stashItem.height(),
      easing: Easings.StrongEaseOut
    });
    await Promise.all([this.popItemAnimation.animate()]);
    this.popItemAnimation.setDestination({
      opacity: 0,
      easing: Easings.StrongEaseOut
    })
    await Promise.all([this.popItemAnimation.animate(), this.stashItemAnimation.animate()]);
  }

  destroy() {
    this.popItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
