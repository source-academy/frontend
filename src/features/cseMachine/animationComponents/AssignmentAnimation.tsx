import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../compactComponents/Binding';
import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { defaultOptions, Text } from '../compactComponents/Text';
import { PrimitiveValue } from '../compactComponents/values/PrimitiveValue';
import { CompactConfig } from '../CseMachineCompactConfig';
import { ControlStashConfig } from '../CseMachineControlStash';
import { getTextWidth } from '../CseMachineUtils';
import { Animatable, AnimatedTextboxComponent, AnimatedTextComponent } from './AnimationComponents';
import { getNodePosition } from './AnimationUtils';

export class AssignmentAnimation extends Animatable {
  private asgnItemAnimation: AnimatedTextboxComponent;
  private stashItemAnimation: AnimatedTextboxComponent;
  private bindingAnimation?: AnimatedTextComponent;

  constructor(
    asgnItem: ControlItemComponent,
    stashItem: StashItemComponent,
    private frame: Frame,
    private binding: Binding
  ) {
    super();
    const asgnItemPosition = getNodePosition(asgnItem);
    const minAsgnItemWidth =
      getTextWidth(asgnItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    const stashItemPosition = getNodePosition(stashItem);
    this.asgnItemAnimation = new AnimatedTextboxComponent(
      asgnItemPosition,
      {
        x: stashItem.x() - minAsgnItemWidth,
        y: stashItem.y(),
        width: minAsgnItemWidth
      },
      asgnItem.text
    );
    this.stashItemAnimation = new AnimatedTextboxComponent(
      stashItemPosition,
      {
        x: frame.x() - stashItemPosition.width,
        y: this.binding.y() + this.binding.height() / 2 - stashItemPosition.height / 2
      },
      stashItem.text,
      { durationMultiplier: 1.5 }
    );
    if (this.binding.value instanceof PrimitiveValue && this.binding.value.text instanceof Text) {
      this.bindingAnimation = new AnimatedTextComponent(
        {
          ...getNodePosition(this.binding.value.text),
          x: this.binding.value.text.x() - 16,
          opacity: 0
        },
        { x: this.binding.value.text.x(), opacity: 1 },
        this.binding.value.text.partialStr,
        { durationMultiplier: 0.5, delayMultiplier: 1 },
        { ...defaultOptions, fill: CompactConfig.SA_WHITE.toString() }
      );
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.asgnItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
        {this.bindingAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    // hide value of binding
    if (this.bindingAnimation) {
      this.binding.value.ref.current.hide();
    }
    // move asgn instruction up, right next to stash item
    await Promise.all([this.asgnItemAnimation.animate()]);
    // move both asgn instruction and stash item down to the frame the binding is in
    await Promise.all([
      this.asgnItemAnimation.animateTo(
        {
          x: this.frame.x() - this.asgnItemAnimation.width() - this.stashItemAnimation.width(),
          y: this.binding.y() + this.binding.height() / 2 - this.asgnItemAnimation.height() / 2
        },
        { durationMultiplier: 1.5 }
      ),
      this.stashItemAnimation.animate()
    ]);
    // move both asgn instruction and stash item right, fade in the binding value
    await Promise.all([
      this.asgnItemAnimation.animateTo(
        {
          x: this.binding.x() - this.asgnItemAnimation.width(),
          opacity: 0
        },
        { durationMultiplier: 1 }
      ),
      this.stashItemAnimation.animateTo(
        {
          x: this.binding.x(),
          opacity: 0
        },
        { durationMultiplier: 1 }
      ),
      this.bindingAnimation?.animate()
    ]);
    this.ref.current?.hide();
    this.binding.value.ref.current?.show();
  }

  destroy() {
    this.binding.value.ref.current?.show();
    this.asgnItemAnimation.destroy();
    this.stashItemAnimation.destroy();
    this.bindingAnimation?.destroy();
  }
}
