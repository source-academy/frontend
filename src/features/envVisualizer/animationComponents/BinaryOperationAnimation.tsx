import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Layout } from '../EnvVisualizerLayout';
import { Animatable, AnimatedTextbox} from './AnimationComponents';
import { getNodeValuesFromItem } from './AnimationUtils';

export class BinaryOperationAnimation extends Animatable {
  binaryOperator: ControlItemComponent;
  operand1: StashItemComponent;
  operand2: StashItemComponent;
  result: StashItemComponent;
  animatedBinaryOp: AnimatedTextbox;
  animatedOperand1: AnimatedTextbox;
  animatedOperand2: AnimatedTextbox;

  constructor(
    binaryOperator: ControlItemComponent,
    operand1: StashItemComponent,
    operand2: StashItemComponent,
    result: StashItemComponent
  ) {
    super();
    this.binaryOperator = binaryOperator;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.result = result;
    const bop_from = getNodeValuesFromItem(this.binaryOperator);
    const bop_to = {
      x: this.operand2.x() + this.operand2.width(),
      y: this.operand2.y(),
      height: this.operand2.height(),
      width: this.operand2.width()
    }
    const op1_from = getNodeValuesFromItem(this.operand1);
    const op2_from = getNodeValuesFromItem(this.operand2);
    const op2_to = {
      x: this.operand2.x() + this.operand2.width() * 3
    }
    this.animatedBinaryOp = new AnimatedTextbox(bop_from, bop_to, this.binaryOperator.text);
    this.animatedOperand1 = new AnimatedTextbox(op1_from, {}, this.operand1.text);
    this.animatedOperand2 = new AnimatedTextbox(op2_from, op2_to, this.operand2.text);
  }
 
  draw(): React.ReactNode {
    Animatable.key++;
    return (
      // TODO: find out why things dont display if the +1 is removed
      <Group key={Layout.key + Animatable.key + 1} ref={this.ref}>
        {this.animatedBinaryOp.draw()}
        {this.animatedOperand1.draw()}
        {this.animatedOperand2.draw()}
      </Group>
    );
  }

  async animate() {
    this.result.ref.current.hide();
    await Promise.all([this.animatedBinaryOp.animate(), this.animatedOperand2.animate()]);
    const to = getNodeValuesFromItem(this.operand1);
    this.animatedBinaryOp.set_to(to);
    this.animatedOperand2.set_to(to);
    await Promise.all([this.animatedBinaryOp.animate(), this.animatedOperand2.animate()]);
    this.ref.current.hide();
    this.result.ref.current.show();
  }

  destroy() {
    this.ref.current.destroy();
  }
}
