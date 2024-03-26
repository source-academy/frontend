import React from 'react';
import { Group } from 'react-konva';

import { ArrayUnit } from '../components/ArrayUnit';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ArrayValue } from '../components/values/ArrayValue';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeDimensions, getNodeLocation, getNodePosition } from './base/AnimationUtils';

export class ArrayAccessAnimation extends Animatable {
  private accessorAnimation: AnimatedTextbox;
  private pairArrayItemAnimation: AnimatedTextbox;
  private indexItemAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;
  private arrayUnit: ArrayUnit;

  constructor(
    accItem: ControlItemComponent,
    pairArrayItem: StashItemComponent,
    indexItem: StashItemComponent,
    private resultItem: StashItemComponent
  ) {
    super();
    this.accessorAnimation = new AnimatedTextbox(accItem.text, getNodePosition(accItem));
    this.pairArrayItemAnimation = new AnimatedTextbox(
      pairArrayItem.text,
      getNodePosition(pairArrayItem)
    );
    this.indexItemAnimation = new AnimatedTextbox(indexItem.text, getNodePosition(indexItem));
    // the target should always be an array value
    const array = pairArrayItem.arrow!.target! as ArrayValue;
    this.arrayUnit = array.units[parseInt(indexItem.text)];
    this.resultAnimation = new AnimatedTextbox(resultItem.text, {
      ...getNodeDimensions(resultItem),
      x: this.arrayUnit.x() + this.arrayUnit.width() / 4,
      y: this.arrayUnit.y(),
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.accessorAnimation.draw()}
        {this.pairArrayItemAnimation.draw()}
        {this.indexItemAnimation.draw()}
        {this.resultAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current.hide();
    await this.indexItemAnimation.animateTo(
      {
        x: this.arrayUnit.x() + this.arrayUnit.width() / 4,
        y: this.arrayUnit.y() - this.indexItemAnimation.height()
      },
      { duration: 1.5 }
    );
    await Promise.all([
      this.indexItemAnimation.animateTo({
        y: this.arrayUnit.y(),
        opacity: 0
      }),
      this.resultAnimation.animateTo({
        y: this.arrayUnit.y() - this.resultItem.height(),
        opacity: 1
      }),
      this.accessorAnimation.animateTo({
        opacity: 0
      }),
      this.pairArrayItemAnimation.animateTo({
        opacity: 0
      })
    ]);
    await this.resultAnimation.animateTo(
      {
        ...getNodeLocation(this.resultItem)
      },
      { duration: 1.5 }
    );
    this.destroy();
  }

  destroy() {
    this.resultItem.ref.current?.show();
    this.accessorAnimation.destroy();
    this.pairArrayItemAnimation.destroy();
    this.indexItemAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
