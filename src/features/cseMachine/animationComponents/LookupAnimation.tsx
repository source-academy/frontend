import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../components/Binding';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { getTextWidth } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class LookupAnimation extends Animatable {
  private nameItemAnimation: AnimatedTextbox;
  private stashItemAnimation: AnimatedTextbox;
  private arrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;

  constructor(
    private nameItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private frame: Frame,
    private binding: Binding
  ) {
    super();
    this.nameItemAnimation = new AnimatedTextbox(nameItem.text, getNodePosition(nameItem));
    this.stashItemAnimation = new AnimatedTextbox(stashItem.text, {
      ...getNodePosition(stashItem),
      x: frame.x(),
      y: binding.y() + binding.height() / 2 - stashItem.height() / 2,
      opacity: 0
    });
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
    const minNameItemWidth =
      getTextWidth(this.nameItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    // move name item next to binding
    await this.nameItemAnimation.animateTo(
      {
        x: this.frame.x() - minNameItemWidth,
        y: this.binding.y() + this.binding.height() / 2 - this.nameItem.height() / 2,
        width: minNameItemWidth
      },
      { duration: 1.5 }
    );
    // the name item 'pulls' the stash item out of the binding
    await Promise.all([
      this.nameItemAnimation.animateTo(
        {
          x: this.frame.x() - this.nameItemAnimation.width() - this.stashItemAnimation.width()
        },
        { duration: 1 }
      ),
      this.stashItemAnimation.animateTo({ x: this.frame.x() - this.stashItem.width(), opacity: 1 })
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
    // fade in the arrow if there is one
    if (this.arrowAnimation) {
      await this.arrowAnimation?.animateTo({ opacity: 1 });
    }
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.stashItem.ref.current?.show();
    this.stashItem.arrow?.ref.current?.show();
    this.nameItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
