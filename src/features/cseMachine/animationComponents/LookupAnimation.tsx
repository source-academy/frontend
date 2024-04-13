import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../components/Binding';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import {
  defaultActiveColor,
  defaultDangerColor,
  defaultStrokeColor,
  getTextWidth,
  isStashItemInDanger
} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

/** Animation for variable lookup */
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
    this.nameItemAnimation = new AnimatedTextbox(nameItem.text, getNodePosition(nameItem), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.stashItemAnimation = new AnimatedTextbox(stashItem.text, {
      ...getNodePosition(stashItem),
      x: frame.x(),
      y: binding.key.y() + binding.key.height() / 2 - stashItem.height() / 2,
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
    this.stashItem.ref.current?.hide();
    if (this.stashItem.arrow) {
      this.stashItem.arrow.ref.current?.hide();
    }
    const minNameItemWidth =
      getTextWidth(this.nameItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    // move name item next to binding
    await Promise.all([
      this.nameItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }, { duration: 1.2 }),
      this.nameItemAnimation.animateTo(
        {
          x: this.frame.x() - minNameItemWidth,
          y: this.binding.key.y() + this.binding.key.height() / 2 - this.nameItem.height() / 2,
          width: minNameItemWidth
        },
        { duration: 1.2 }
      )
    ]);
    // the name item 'pulls' the stash item out of the binding
    await Promise.all([
      this.nameItemAnimation.animateTo({
        x: this.frame.x() - this.nameItemAnimation.width() - this.stashItemAnimation.width()
      }),
      this.stashItemAnimation.animateTo({ x: this.frame.x() - this.stashItem.width(), opacity: 1 })
    ]);
    // move both name item and stash item to the stash, while fading out the name item
    await Promise.all([
      this.nameItemAnimation.animateTo(
        {
          x: this.stashItem.x() - this.nameItemAnimation.width(),
          y: this.stashItem.y(),
          opacity: 0
        },
        { duration: 1.2 }
      ),
      this.stashItemAnimation.animateTo(
        {
          x: this.stashItem.x(),
          y: this.stashItem.y()
        },
        { duration: 1.2 }
      ),
      isStashItemInDanger(this.stashItem.index) &&
        this.stashItemAnimation.animateRectTo({ stroke: defaultDangerColor() }, { duration: 1.2 }),
      // fade in the arrow if there is one
      this.arrowAnimation?.animateTo({ opacity: 1 }, { delay: 1.2 })
    ]);
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
