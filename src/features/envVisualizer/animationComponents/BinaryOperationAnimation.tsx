import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodeValuesFromItem } from './AnimationUtils';

export class BinaryOperationAnimation extends Animatable {
  private binaryOperatorAnimation: AnimatedTextboxComponent;
  private leftOperandAnimation: AnimatedTextboxComponent;
  private rightOperandAnimation: AnimatedTextboxComponent;
  private resultAnimation: AnimatedTextboxComponent;

  constructor(
    private binaryOperator: ControlItemComponent,
    private leftOperand: StashItemComponent,
    private rightOperand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    const binOpValues = getNodeValuesFromItem(this.binaryOperator);
    const leftOpValues = getNodeValuesFromItem(this.leftOperand);
    const rightOpValues = getNodeValuesFromItem(this.rightOperand);
    const resultValues = getNodeValuesFromItem(this.result);
    this.binaryOperatorAnimation = new AnimatedTextboxComponent(
      binOpValues,
      rightOpValues,
      this.binaryOperator.text
    );
    this.rightOperandAnimation = new AnimatedTextboxComponent(
      rightOpValues,
      { ...rightOpValues, x: rightOpValues.x + rightOpValues.width },
      this.rightOperand.text
    );
    this.leftOperandAnimation = new AnimatedTextboxComponent(
      leftOpValues,
      { opacity: 0 },
      this.leftOperand.text
    );
    this.resultAnimation = new AnimatedTextboxComponent(
      { ...rightOpValues, opacity: 0 },
      { ...resultValues, opacity: 1 },
      this.result.text,
      { delayMultiplier: 0.5 }
    );
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
    this.result.ref.current.hide();
    await Promise.all([
      this.binaryOperatorAnimation.animate(),
      this.rightOperandAnimation.animate()
    ]);
    const to = { ...getNodeValuesFromItem(this.result), opacity: 0 };
    this.binaryOperatorAnimation.setDestination(to);
    this.rightOperandAnimation.setDestination(to);
    await Promise.all([
      this.binaryOperatorAnimation.animate(),
      this.leftOperandAnimation.animate(),
      this.rightOperandAnimation.animate(),
      this.resultAnimation.animate()
    ]);
    this.ref.current?.hide();
    this.result.ref.current?.show();
  }

  destroy() {
    this.binaryOperatorAnimation.destroy();
    this.leftOperandAnimation.destroy();
    this.rightOperandAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
