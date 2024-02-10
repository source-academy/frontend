import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Layout } from '../EnvVisualizerLayout';
import { Animatable, AnimatedTextbox} from './AnimationComponents';
import { getNodeValuesFromItem } from './AnimationUtils';

export class UnaryOperationAnimation extends Animatable {
  unaryOperator: ControlItemComponent;
  operand: StashItemComponent;
  result: StashItemComponent;
  animatedUnaryOp: AnimatedTextbox;
  animatedOperand: AnimatedTextbox;

  constructor(
    unaryOperator: ControlItemComponent,
    operand: StashItemComponent,
    result: StashItemComponent
  ) {
    super();
    this.unaryOperator = unaryOperator;
    this.operand = operand;
    this.result = result;
    const uop_from = getNodeValuesFromItem(this.unaryOperator);
    const uop_to = {
      x: this.operand.x() + this.operand.width(),
      y: this.operand.y(),
      height: this.operand.height(),
      width: this.operand.width()
    }
    const op_from = getNodeValuesFromItem(this.operand);
    this.animatedUnaryOp = new AnimatedTextbox(uop_from, uop_to, this.unaryOperator.text);
    this.animatedOperand = new AnimatedTextbox(op_from, {}, this.operand.text);
  }
 
  draw(): React.ReactNode {
    Animatable.key++;
    return (
      // TODO: find out why things dont display if the +1 is removed
      <Group key={Layout.key + Animatable.key + 1} ref={this.ref}>
        {this.animatedUnaryOp.draw()}
        {this.animatedOperand.draw()}
      </Group>
    );
  }

  async animate() {
    this.result.ref.current.hide();
    await Promise.all([this.animatedUnaryOp.animate()]);
    const to = getNodeValuesFromItem(this.result);
    this.animatedUnaryOp.set_to(to);
    this.animatedOperand.set_to(to);
    await Promise.all([this.animatedUnaryOp.animate(), this.animatedOperand.animate()]);
    this.ref.current.hide();
    this.result.ref.current.show();
  }

  destroy() {
    this.ref.current.destroy();
  }
}
