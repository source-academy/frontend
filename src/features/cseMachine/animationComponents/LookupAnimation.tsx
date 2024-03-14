import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../compactComponents/Binding';
import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStash';
import { getTextWidth } from '../CseMachineUtils';
import { AnimatedGenericArrow } from './AnimatedArrowComponents';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePosition } from './AnimationUtils';

export class LookupAnimation extends Animatable {
  private nameItemAnimation: AnimatedTextboxComponent;
  private stashItemAnimation: AnimatedTextboxComponent;
  private arrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;

  constructor(
    nameItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private frame: Frame,
    binding: Binding
  ) {
    super();
    const nameItemPosition = getNodePosition(nameItem);
    const minNameItemWidth =
      getTextWidth(nameItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    const stashItemPosition = getNodePosition(stashItem);
    this.nameItemAnimation = new AnimatedTextboxComponent(
      nameItemPosition,
      {
        x: frame.x() - minNameItemWidth,
        y: binding.y() + binding.height() / 2 - nameItemPosition.height / 2,
        width: minNameItemWidth
      },
      nameItem.text,
      { durationMultiplier: 1.5 }
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
    if (stashItem.arrow) {
      this.arrowAnimation = new AnimatedGenericArrow(stashItem.arrow, { opacity: 0 });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.nameItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
        {this.arrowAnimation?.draw()}
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
    if (this.arrowAnimation) {
      await this.arrowAnimation?.animateTo({ opacity: 1 });
    }
    this.ref.current?.hide();
    this.stashItem.ref.current?.show();
    if (this.stashItem.arrow) {
      this.stashItem.arrow.ref.current?.show();
    }
  }

  destroy() {
    this.stashItem.ref.current.show();
    this.stashItem.arrow?.ref.current?.show();
    this.nameItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
