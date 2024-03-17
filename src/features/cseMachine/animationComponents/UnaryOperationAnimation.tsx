import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class UnaryOperationAnimation extends Animatable {
  private operatorAnimation: AnimatedTextbox;
  private operandAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;

  constructor(
    operator: ControlItemComponent,
    private operand: StashItemComponent,
    private result: StashItemComponent
  ) {
    super();
    this.operatorAnimation = new AnimatedTextbox(operator.text, getNodePosition(operator));
    this.operandAnimation = new AnimatedTextbox(operand.text, getNodePosition(operand));
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
    this.result.ref.current.hide();
    const operandPosition = getNodePosition(this.operand);
    const resultPosition = getNodePosition(this.result);
    await Promise.all([
      this.operatorAnimation.animateTo(operandPosition),
      this.operandAnimation.animateTo({
        ...operandPosition,
        x: operandPosition.x + operandPosition.width
      })
    ]);
    await Promise.all([
      this.operatorAnimation.animateTo({ ...resultPosition, opacity: 0 }),
      this.operandAnimation.animateTo({ ...resultPosition, opacity: 0 }),
      this.resultAnimation.animateTo({ ...resultPosition, opacity: 1 }, { delay: 0.5 })
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
