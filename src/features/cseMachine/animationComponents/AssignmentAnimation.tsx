import React from 'react';
import { Group } from 'react-konva';

import { Binding } from '../components/Binding';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { defaultOptions, Text } from '../components/Text';
import { PrimitiveValue } from '../components/values/PrimitiveValue';
import { Value } from '../components/values/Value';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor, getTextWidth } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

/** Animation for a variable assignment */
export class AssignmentAnimation extends Animatable {
  private asgnItemAnimation: AnimatedTextbox;
  private stashItemAnimation: AnimatedTextbox;
  private bindingAnimation?: AnimatedTextComponent;
  private arrowAnimation?: AnimatedGenericArrow<Text, Value>;

  private stashItemIsFirst: boolean;

  constructor(
    private asgnItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private frame: Frame,
    private binding: Binding
  ) {
    super();
    this.stashItemIsFirst = stashItem.index === 0;
    this.asgnItemAnimation = new AnimatedTextbox(asgnItem.text, getNodePosition(asgnItem), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.stashItemAnimation = new AnimatedTextbox(stashItem.text, getNodePosition(stashItem));
    if (this.binding.value instanceof PrimitiveValue && this.binding.value.text instanceof Text) {
      this.bindingAnimation = new AnimatedTextComponent({
        ...defaultOptions,
        ...getNodePosition(this.binding.value.text),
        text: this.binding.value.text.partialStr,
        x: this.binding.value.text.x() - 16,
        opacity: 0
      });
    }
  }

  draw(): React.ReactNode {
    // Arrow only gets updated when drawn, so animated arrow is initialised here instead
    if (this.binding.arrow) {
      this.arrowAnimation = new AnimatedGenericArrow(this.binding.arrow, { x: -16, opacity: 0 });
    }
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.asgnItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
        {this.bindingAnimation?.draw()}
        {this.arrowAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    const minAsgnItemWidth =
      getTextWidth(this.asgnItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    // hide value of binding
    if (this.bindingAnimation) this.binding.value.ref.current?.hide();
    // hide arrow
    this.binding.arrow?.ref.current?.hide();
    // move asgn instruction next to stash item, while also decreasing its width
    await Promise.all([
      this.asgnItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.asgnItemAnimation.animateTo({
        x: this.stashItem.x() - (this.stashItemIsFirst ? minAsgnItemWidth : 0),
        y: this.stashItem.y() + (this.stashItemIsFirst ? 0 : this.stashItem.height()),
        width: minAsgnItemWidth
      })
    ]);
    // move both asgn instruction and stash item down to the frame the binding is in
    await Promise.all([
      this.asgnItemAnimation.animateTo(
        {
          x: this.frame.x() - this.asgnItemAnimation.width() - this.stashItemAnimation.width(),
          y: this.bindingAnimation
            ? this.binding.y() + this.binding.height() / 2 - this.asgnItemAnimation.height() / 2
            : this.binding.y()
        },
        { duration: 1.2 }
      ),
      this.stashItemAnimation.animateTo(
        {
          x: this.frame.x() - this.stashItem.width(),
          y: this.bindingAnimation
            ? this.binding.y() + this.binding.height() / 2 - this.asgnItemAnimation.height() / 2
            : this.binding.y()
        },
        { duration: 1.2 }
      )
    ]);
    // move both asgn instruction and stash item right, fade in the binding value and binding arrow
    await Promise.all([
      this.asgnItemAnimation.animateTo({
        x: this.binding.x() - this.asgnItemAnimation.width(),
        opacity: 0
      }),
      this.stashItemAnimation.animateTo({
        x: this.binding.x(),
        opacity: 0
      }),
      this.bindingAnimation?.animateTo(
        { x: (this.binding.value as PrimitiveValue).text.x(), opacity: 1 },
        { duration: 0.5, delay: 0.5 }
      ),
      this.arrowAnimation?.animateTo({ x: 0, opacity: 1 }, { duration: 0.5, delay: 0.5 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.binding.value.ref.current?.show();
    this.binding.arrow?.ref.current?.show();
    this.asgnItemAnimation.destroy();
    this.stashItemAnimation.destroy();
    this.bindingAnimation?.destroy();
    this.arrowAnimation?.destroy();
  }
}
