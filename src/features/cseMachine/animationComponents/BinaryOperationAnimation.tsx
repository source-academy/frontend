import { NodeConfig } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class BinaryOperationAnimation extends Animatable {
  private binaryOperatorAnimation: AnimatedTextboxComponent;
  private leftOperandAnimation: AnimatedTextboxComponent;
  private rightOperandAnimation: AnimatedTextboxComponent;
  private resultAnimation: AnimatedTextboxComponent;
  private resultPosition: NodeConfig;

  constructor(
    binaryOperator: ControlItemComponent,
    leftOperand: StashItemComponent,
    rightOperand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    const binOpPosition = getNodePositionFromItem(binaryOperator);
    const leftOpPosition = getNodePositionFromItem(leftOperand);
    const rightOpPosition = getNodePositionFromItem(rightOperand);
    const resultPosition = getNodePositionFromItem(result);
    this.resultPosition = resultPosition;
    this.binaryOperatorAnimation = new AnimatedTextboxComponent(
      binOpPosition,
      rightOpPosition,
      binaryOperator.text
    );
    this.rightOperandAnimation = new AnimatedTextboxComponent(
      rightOpPosition,
      { ...rightOpPosition, x: rightOpPosition.x + rightOpPosition.width },
      rightOperand.text
    );
    this.leftOperandAnimation = new AnimatedTextboxComponent(
      leftOpPosition,
      { opacity: 0 },
      leftOperand.text
    );
    this.resultAnimation = new AnimatedTextboxComponent(
      {
        ...resultPosition,
        x: rightOpPosition.x,
        opacity: 0
      },
      { ...resultPosition, opacity: 1 },
      result.text,
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
    // Shifts the right operand to the right and move the operator in between the operands
    await Promise.all([
      this.binaryOperatorAnimation.animate(),
      this.rightOperandAnimation.animate()
    ]);
    // Merges the operators and operands together to form the result
    const to = { ...this.resultPosition, opacity: 0 };
    await Promise.all([
      this.binaryOperatorAnimation.animateTo(to),
      this.leftOperandAnimation.animate(),
      this.rightOperandAnimation.animateTo(to),
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
