import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { getTextWidth } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class BinaryOperationAnimation extends Animatable {
  private binaryOperatorAnimation: AnimatedTextbox;
  private leftOperandAnimation: AnimatedTextbox;
  private rightOperandAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;

  constructor(
    private binaryOperator: ControlItemComponent,
    leftOperand: StashItemComponent,
    private rightOperand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    this.binaryOperatorAnimation = new AnimatedTextbox(
      binaryOperator.text,
      getNodePosition(binaryOperator)
    );
    this.rightOperandAnimation = new AnimatedTextbox(
      rightOperand.text,
      getNodePosition(rightOperand)
    );
    this.leftOperandAnimation = new AnimatedTextbox(leftOperand.text, getNodePosition(leftOperand));
    this.resultAnimation = new AnimatedTextbox(result.text, {
      ...getNodePosition(result),
      x: rightOperand.x(),
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.binaryOperatorAnimation.draw()}
        {this.leftOperandAnimation.draw()}
        {this.rightOperandAnimation.draw()}
        {this.resultAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.result.ref.current?.hide();
    const rightOpPosition = getNodePosition(this.rightOperand);
    const resultPosition = getNodePosition(this.result);
    const minBinOpWidth =
      getTextWidth(this.binaryOperator.text) + ControlStashConfig.ControlItemTextPadding * 2;
    const fadeDuration = 3 / 4;
    const fadeInDelay = 1 / 4;
    // Shifts the right operand to the right and move the operator in between the operands
    await Promise.all([
      this.binaryOperatorAnimation.animateTo({ ...rightOpPosition, width: minBinOpWidth }),
      this.rightOperandAnimation.animateTo({
        ...rightOpPosition,
        x: rightOpPosition.x + minBinOpWidth
      })
    ]);
    // Merges the operators and operands together to form the result
    await Promise.all([
      this.binaryOperatorAnimation.animateTo(resultPosition),
      this.binaryOperatorAnimation.animateTo({ opacity: 0 }, { duration: fadeDuration }),
      this.leftOperandAnimation.animateTo({ opacity: 0 }, { duration: fadeDuration }),
      this.rightOperandAnimation.animateTo(resultPosition),
      this.rightOperandAnimation.animateTo({ opacity: 0 }, { duration: fadeDuration }),
      this.resultAnimation.animateTo(resultPosition),
      this.resultAnimation.animateTo({ opacity: 1 }, { duration: fadeDuration, delay: fadeInDelay })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.result.ref.current?.show();
    this.binaryOperatorAnimation.destroy();
    this.leftOperandAnimation.destroy();
    this.rightOperandAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
