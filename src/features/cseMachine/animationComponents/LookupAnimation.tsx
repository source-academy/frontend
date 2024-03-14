import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../compactComponents/Binding';
import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { ControlStashConfig } from '../CseMachineControlStash';
import { getTextWidth } from '../CseMachineUtils';
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
        y: binding.y() + binding.height() / 2 - nameItemPosition.height / 2,
        width: minNameItemWidth
      },
      nameItem.text,
      { durationMultiplier: 2 }
    );
    this.stashItemAnimation = new AnimatedTextboxComponent(
      {
        ...stashItemPosition,
        x: frame.x(),
        y: binding.y() + binding.height() / 2 - stashItemPosition.height / 2,
        opacity: 0
      },
      { x: frame.x() - stashItemPosition.width, opacity: 1 },
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
    if (this.stashItem.arrow) {
      this.stashItem.arrow.ref.current?.hide();
    }
    // move name item next to binding
    await Promise.all([this.nameItemAnimation.animate()]);
    // the name item 'pulls' the stash item out of the binding
    await Promise.all([
      this.nameItemAnimation.animateTo(
        {
          x: this.frame.x() - this.nameItemAnimation.width() - this.stashItemAnimation.width()
        },
        { durationMultiplier: 1 }
      ),
      this.stashItemAnimation.animate()
    ]);
    // move both name item and stash item to the stash, while fading out the name item
    await Promise.all([
      this.nameItemAnimation.animateTo({
        x: this.stashItem.x() - this.nameItemAnimation.width(),
        y: this.stashItem.y(),
        opacity: 0
      }),
      this.stashItemAnimation.animateTo({
        x: this.stashItem.x(),
        y: this.stashItem.y()
      })
    ]);
    this.ref.current?.hide();
    this.stashItem.ref.current?.show();
    if (this.stashItem.arrow) {
      this.stashItem.arrow.ref.current?.show();
    }
  }

  destroy() {
    this.stashItem.ref.current.show();
    this.nameItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
