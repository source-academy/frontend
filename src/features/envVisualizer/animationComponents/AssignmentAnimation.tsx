import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class AssignmentAnimation extends Animatable {
  private asgnItemAnimation: AnimatedTextboxComponent;
  private stashItemAnimation: AnimatedTextboxComponent;

  constructor(private asgnItem: ControlItemComponent, private stashItem: StashItemComponent,
      prevFrame: Frame, private currFrame: Frame) {
    super();
    const asgnItemPosition = getNodePositionFromItem(asgnItem);
    const stashItemPosition = getNodePositionFromItem(stashItem);
    this.asgnItemAnimation = new AnimatedTextboxComponent(
      { ...asgnItemPosition },
      {
        x: stashItem.x() - asgnItem.width(),
        y: stashItem.y()
      },
      asgnItem.text
    )
    this.stashItemAnimation = new AnimatedTextboxComponent(
      { ...stashItemPosition },
      {
        x: prevFrame.x() - this.stashItem.width(),
        y: prevFrame.y()
      },
      stashItem.text,
    );
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.asgnItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    await Promise.all([this.asgnItemAnimation.animate()]);
    this.asgnItemAnimation.setDestination({
      x: this.currFrame.x() - this.asgnItem.width() - this.stashItem.width(),
      y: this.currFrame.y()
    })
    await Promise.all([this.asgnItemAnimation.animate(), this.stashItemAnimation.animate()]);
    this.asgnItemAnimation.setDestination({
      x: this.currFrame.x() - this.asgnItem.width(),
      opacity: 0
    });
    this.stashItemAnimation.setDestination({
      x: this.currFrame.x(),
      opacity: 0
    });
    await Promise.all([this.asgnItemAnimation.animate(), this.stashItemAnimation.animate()]);
  }

  destroy() {
    this.asgnItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
