import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeDimensions, getNodeLocation, getNodePosition } from './base/AnimationUtils';

export class ArrowFunctionExpressionAnimation extends Animatable {
  private controlItemAnimation: AnimatedTextbox;
  private closureItemAnimation: AnimatedTextbox;

  constructor(
    lambdaItem: ControlItemComponent,
    private closureItem: StashItemComponent
  ) {
    super();
    this.controlItemAnimation = new AnimatedTextbox(lambdaItem.text, getNodePosition(lambdaItem));
    this.closureItemAnimation = new AnimatedTextbox(closureItem.text, {
      ...getNodeDimensions(closureItem),
      ...getNodeLocation(lambdaItem),
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.controlItemAnimation.draw()}
        {this.closureItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.closureItem.ref.current.hide();
    await Promise.all([
      this.controlItemAnimation.animateTo({
        ...getNodeDimensions(this.closureItem),
        opacity: 0
      }),
      this.closureItemAnimation.animateTo({ opacity: 1 })
    ]);
    await this.closureItemAnimation.animateTo(getNodeLocation(this.closureItem));
    this.destroy();
  }

  destroy() {
    this.closureItem.ref.current?.show();
    this.controlItemAnimation.destroy();
    this.closureItemAnimation.destroy();
  }
}
