import React from 'react';
import { Group } from 'react-konva';

import { GenericArrow } from '../compactComponents/arrows/GenericArrow';
import { Binding } from '../compactComponents/Binding';
import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { defaultOptions, Text } from '../compactComponents/Text';
import { PrimitiveValue } from '../compactComponents/values/PrimitiveValue';
import { Value } from '../compactComponents/values/Value';
import { CompactConfig } from '../CseMachineCompactConfig';
import { ControlStashConfig } from '../CseMachineControlStash';
import { getTextWidth } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

export class AssignmentAnimation extends Animatable {
  private asgnItemAnimation: AnimatedTextbox;
  private stashItemAnimation: AnimatedTextbox;
  private bindingAnimation?: AnimatedTextComponent;
  private arrowAnimation?: AnimatedGenericArrow<Text, Value>;

  private arrow?: GenericArrow<Text, Value>;

  constructor(
    private asgnItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private frame: Frame,
    private binding: Binding
  ) {
    super();
    this.asgnItemAnimation = new AnimatedTextbox(asgnItem.text, getNodePosition(asgnItem));
    this.stashItemAnimation = new AnimatedTextbox(stashItem.text, getNodePosition(stashItem));
    if (this.binding.value instanceof PrimitiveValue && this.binding.value.text instanceof Text) {
      this.bindingAnimation = new AnimatedTextComponent({
        ...defaultOptions,
        ...getNodePosition(this.binding.value.text),
        text: this.binding.value.text.partialStr,
        fill: CompactConfig.SA_WHITE.toString(),
        x: this.binding.value.text.x() - 16,
        opacity: 0
      });
    } else if (this.binding.getArrow()) {
      const arrow = this.binding.getArrow()!;
      this.arrow = arrow;
      this.arrowAnimation = new AnimatedGenericArrow(arrow, { x: -16, opacity: 0 });
    }
  }

  draw(): React.ReactNode {
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
      getTextWidth(this.asgnItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    // hide value of binding
    if (this.bindingAnimation) this.binding.value.ref.current.hide();
    // hide arrow
    if (this.arrow) this.arrow.ref.current.hide();
    // move asgn instruction up, right next to stash item, while also decreasing its width
    await this.asgnItemAnimation.animateTo({
      x: this.stashItem.x() - minAsgnItemWidth,
      y: this.stashItem.y(),
      width: minAsgnItemWidth
    });
    // move both asgn instruction and stash item down to the frame the binding is in
    await Promise.all([
      this.asgnItemAnimation.animateTo(
        {
          x: this.frame.x() - this.asgnItemAnimation.width() - this.stashItemAnimation.width(),
          y: this.binding.y() + this.binding.height() / 2 - this.asgnItemAnimation.height() / 2
        },
        { duration: 1.5 }
      ),
      this.stashItemAnimation.animateTo(
        {
          x: this.frame.x() - this.stashItem.width(),
          y: this.binding.y() + this.binding.height() / 2 - this.stashItem.height() / 2
        },
        { duration: 1.5 }
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
    this.arrow?.ref.current?.show();
    this.asgnItemAnimation.destroy();
    this.stashItemAnimation.destroy();
    this.bindingAnimation?.destroy();
    this.arrowAnimation?.destroy();
  }
}
