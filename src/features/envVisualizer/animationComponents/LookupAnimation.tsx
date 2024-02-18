import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../compactComponents/Binding';
import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { ControlStashConfig } from '../EnvVisualizerControlStash';
import { getTextWidth } from '../EnvVisualizerUtils';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class LookupAnimation extends Animatable {
  private nameItemAnimation: AnimatedTextboxComponent;
  private stashItemAnimation: AnimatedTextboxComponent;

  constructor(
    nameItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private frame: Frame,
    binding: Binding
  ) {
    super();
    const nameItemPosition = getNodePositionFromItem(nameItem);
    const minNameItemWidth =
      getTextWidth(nameItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    const stashItemPosition = getNodePositionFromItem(stashItem);
    this.nameItemAnimation = new AnimatedTextboxComponent(
      nameItemPosition,
      {
        x: frame.x() - minNameItemWidth,
        y: binding.y() - binding.height() / 2,
        width: minNameItemWidth
      },
      nameItem.text
    );
    this.stashItemAnimation = new AnimatedTextboxComponent(
      {
        x: frame.x(),
        y: binding.y() - binding.height() / 2,
        width: stashItemPosition.width,
        height: stashItemPosition.height,
        opacity: 0
      },
      {
        x: frame.x() - stashItemPosition.width,
        opacity: 1
      },
      stashItem.text
    );
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.nameItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.stashItem.ref.current.hide();
    // move name item next to binding
    await Promise.all([this.nameItemAnimation.animate()]);
    // the name item 'pulls' the stash item out of the binding
    this.nameItemAnimation.setDestination({
      x: this.frame.x() - this.nameItemAnimation.width() - this.stashItemAnimation.width()
    });
    await Promise.all([this.nameItemAnimation.animate(), this.stashItemAnimation.animate()]);
    // move both name item and stash item to the stash
    this.nameItemAnimation.setDestination({
      x: this.stashItem.x() - this.nameItemAnimation.width(),
      y: this.stashItem.y()
    });
    this.stashItemAnimation.setDestination({
      x: this.stashItem.x(),
      y: this.stashItem.y()
    });
    await Promise.all([this.nameItemAnimation.animate(), this.stashItemAnimation.animate()]);
    // make the name item disappear
    this.nameItemAnimation.setDestination({
      opacity: 0
    });
    await Promise.all([this.nameItemAnimation.animate()]);
    this.stashItemAnimation.ref.current.hide();
    this.stashItem.ref.current?.show();
  }

  destroy() {
    this.stashItem.ref.current.show();
    this.nameItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
