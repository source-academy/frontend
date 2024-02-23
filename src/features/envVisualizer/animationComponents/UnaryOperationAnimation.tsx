import { NodeConfig } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class UnaryOperationAnimation extends Animatable {
  private operatorAnimation: AnimatedTextboxComponent;
  private operandAnimation: AnimatedTextboxComponent;
  private resultAnimation: AnimatedTextboxComponent;
  private resultPosition: NodeConfig;

  constructor(
    operator: ControlItemComponent,
    operand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    const operatorPosition = getNodePositionFromItem(operator);
    const operandPosition = getNodePositionFromItem(operand);
    const resultPosition = getNodePositionFromItem(result);
    this.resultPosition = resultPosition;
    this.operatorAnimation = new AnimatedTextboxComponent(
      operatorPosition,
      operandPosition,
      operator.text
    );
    this.operandAnimation = new AnimatedTextboxComponent(
      operandPosition,
      { ...operandPosition, x: operandPosition.x + operandPosition.width },
      operand.text
    );
    this.resultAnimation = new AnimatedTextboxComponent(
      { ...resultPosition, x: operandPosition.x + operandPosition.width / 2, opacity: 0 },
      { ...resultPosition, opacity: 1 },
      result.text,
      { delayMultiplier: 0.5 }
    );
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
    this.result.ref.current.hide();
    await Promise.all([this.operatorAnimation.animate(), this.operandAnimation.animate()]);
    const to = { ...this.resultPosition, opacity: 0 };
    this.operatorAnimation.setDestination(to);
    this.operandAnimation.setDestination(to);
    await Promise.all([
      this.operatorAnimation.animate(),
      this.operandAnimation.animate(),
      this.resultAnimation.animate()
    ]);
    this.ref.current?.hide();
    this.result.ref.current?.show();
  }

  destroy() {
    this.operatorAnimation.destroy();
    this.operandAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
