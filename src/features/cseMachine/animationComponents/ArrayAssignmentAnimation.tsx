import React from 'react';
import { Group } from 'react-konva';

import { ArrayUnit } from '../components/ArrayUnit';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ArrayValue } from '../components/values/ArrayValue';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class ArrayAssignmentAnimation extends Animatable {
  private asgnItemAnimation: AnimatedTextbox;
  private pairArrayItemAnimation: AnimatedTextbox;
  private indexItemAnimation: AnimatedTextbox;
  private valueAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;
  private arrayUnit: ArrayUnit;

  constructor(
    asgnItem: ControlItemComponent,
    pairArrayItem: StashItemComponent,
    indexItem: StashItemComponent,
    valueItem: StashItemComponent,
    private resultItem: StashItemComponent
  ) {
    super();
    this.asgnItemAnimation = new AnimatedTextbox(asgnItem.text, getNodePosition(asgnItem));
    this.pairArrayItemAnimation = new AnimatedTextbox(
      pairArrayItem.text,
      getNodePosition(pairArrayItem)
    );
    this.indexItemAnimation = new AnimatedTextbox(indexItem.text, getNodePosition(indexItem));
    this.valueAnimation = new AnimatedTextbox(valueItem.text, getNodePosition(valueItem));
    this.resultAnimation = new AnimatedTextbox(resultItem.text, getNodePosition(valueItem));
    // the target should always be an array value
    const array = pairArrayItem.arrow!.target! as ArrayValue;
    this.arrayUnit = array.units[parseInt(indexItem.text)];
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.asgnItemAnimation.draw()}
        {this.pairArrayItemAnimation.draw()}
        {this.indexItemAnimation.draw()}
        {this.valueAnimation.draw()}
        {this.resultAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current.hide();
    // move the value near to the correct array unit
    await this.valueAnimation.animateTo(
      {
        x: this.arrayUnit.x() + this.arrayUnit.width() / 4,
        y: this.arrayUnit.y() - this.indexItemAnimation.height()
      },
      { duration: 1.5 }
    );
    // insert the value into the array while fading out unnecessary items
    await Promise.all([
      this.valueAnimation.animateTo({
        y: this.arrayUnit.y(),
        opacity: 0
      }),
      this.resultAnimation.animateTo({
        x: this.resultItem.x()
      }),
      this.asgnItemAnimation.animateTo({
        opacity: 0
      }),
      this.pairArrayItemAnimation.animateTo({
        opacity: 0
      }),
      this.indexItemAnimation.animateTo({
        opacity: 0
      })
    ]);
    this.destroy();
  }

  destroy() {
    this.resultItem.ref.current?.show();
    this.asgnItemAnimation.destroy();
    this.pairArrayItemAnimation.destroy();
    this.indexItemAnimation.destroy();
    this.valueAnimation.destroy();
    this.resultAnimation.destroy();
  }
}
