import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import {
  defaultActiveColor,
  defaultDangerColor,
  defaultStrokeColor,
  getTextWidth,
  isStashItemInDanger
} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

/** Animation for an unary operation, e.g. `-`, `!` */
export class UnaryOperationAnimation extends Animatable {
  private operatorAnimation: AnimatedTextbox;
  private operandAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;

  constructor(
    private operator: ControlItemComponent,
    private operand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    this.operatorAnimation = new AnimatedTextbox(operator.text, getNodePosition(operator), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.operandAnimation = new AnimatedTextbox(operand.text, getNodePosition(operand), {
      rectProps: { stroke: defaultDangerColor() }
    });
    this.resultAnimation = new AnimatedTextbox(result.text, {
      ...getNodePosition(result),
      x: operand.x() + operand.width() / 2,
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.operatorAnimation.draw()}
        {this.operandAnimation.draw()}
        {this.resultAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.result.ref.current?.hide();
    const minOpWidth =
      getTextWidth(this.operator.text) + ControlStashConfig.ControlItemTextPadding * 2;
    // Move operator next to operand, while moving operand to make space
    await Promise.all([
      this.resultAnimation.animateTo(
        {
          x:
            this.operand.x() +
            (this.operand.x() + minOpWidth + this.operand.width()) / 2 +
            this.result.width() / 2
        },
        { duration: 0 }
      ),
      this.operatorAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.operatorAnimation.animateTo({
        x: this.operand.x(),
        y: this.result.y(),
        width: minOpWidth
      }),
      this.operandAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.operandAnimation.animateTo({
        x: this.operand.x() + minOpWidth
      })
    ]);
    const fadeDuration = 3 / 4;
    const fadeInDelay = 1 / 4;
    await Promise.all([
      this.operatorAnimation.animateTo({ width: this.result.width() }),
      this.operatorAnimation.animateTo({ opacity: 0 }, { duration: fadeDuration }),
      this.operandAnimation.animateTo({ x: this.result.x(), width: this.result.width() }),
      this.operandAnimation.animateTo({ opacity: 0 }, { duration: fadeDuration }),
      this.resultAnimation.animateTo({ x: this.result.x() }),
      this.resultAnimation.animateTo(
        { opacity: 1 },
        { duration: fadeDuration, delay: fadeInDelay }
      ),
      isStashItemInDanger(this.result.index) &&
        this.resultAnimation.animateRectTo({ stroke: defaultDangerColor() })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.result.ref.current?.show();
    this.operatorAnimation.destroy();
    this.operandAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
