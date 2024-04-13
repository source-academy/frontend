import React from 'react';
import { Group } from 'react-konva';

import { ArrayUnit } from '../components/ArrayUnit';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ArrayValue } from '../components/values/ArrayValue';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import {
  defaultActiveColor,
  defaultDangerColor,
  defaultStrokeColor,
  getTextWidth,
  isStashItemInDanger
} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeDimensions, getNodeLocation, getNodePosition } from './base/AnimationUtils';

/** Animation for array access */
export class ArrayAccessAnimation extends Animatable {
  private accessorAnimation: AnimatedTextbox;
  private arrayItemAnimation: AnimatedTextbox;
  private arrayArrowAnimation: AnimatedGenericArrow<StashItemComponent, Visible>;
  private indexItemAnimation: AnimatedTextbox;
  private resultAnimation: AnimatedTextbox;
  private resultArrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;
  private arrayUnit: ArrayUnit;

  constructor(
    private accInstr: ControlItemComponent,
    arrayItem: StashItemComponent,
    private indexItem: StashItemComponent,
    private resultItem: StashItemComponent
  ) {
    super();
    this.accessorAnimation = new AnimatedTextbox(accInstr.text, getNodePosition(accInstr), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.arrayItemAnimation = new AnimatedTextbox(arrayItem.text, getNodePosition(arrayItem), {
      rectProps: { stroke: defaultDangerColor() }
    });
    this.indexItemAnimation = new AnimatedTextbox(indexItem.text, getNodePosition(indexItem), {
      rectProps: { stroke: defaultDangerColor() }
    });
    this.arrayArrowAnimation = new AnimatedGenericArrow(arrayItem.arrow!);
    // the target should always be an array value
    const array = arrayItem.arrow!.target! as ArrayValue;
    this.arrayUnit = array.units[parseInt(indexItem.text)];
    this.resultAnimation = new AnimatedTextbox(resultItem.text, {
      ...getNodeDimensions(resultItem),
      x: this.arrayUnit.x() + this.arrayUnit.width() / 2 - this.resultItem.width() / 2,
      y: this.arrayUnit.y() + this.arrayUnit.height() / 2 - this.resultItem.height() / 2,
      opacity: 0
    });
    if (this.resultItem.arrow) {
      this.resultArrowAnimation = new AnimatedGenericArrow(this.resultItem.arrow, { opacity: 0 });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.accessorAnimation.draw()}
        {this.arrayItemAnimation.draw()}
        {this.arrayArrowAnimation.draw()}
        {this.indexItemAnimation.draw()}
        {this.resultAnimation.draw()}
        {this.resultArrowAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current?.hide();
    this.resultItem.arrow?.ref.current?.hide();
    const minInstrItemWidth =
      getTextWidth(this.accInstr.text) + ControlStashConfig.ControlItemTextPadding * 2;
    const indexAboveArrayLocation = {
      x: this.arrayUnit.x() + this.arrayUnit.width() / 2 - this.indexItem.width() / 2,
      y: this.arrayUnit.y() - this.indexItem.height() - 8
    };
    const indexInArrayLocation = {
      y: this.arrayUnit.y() + this.arrayUnit.height() / 2 - this.indexItem.height() / 2
    };
    const resultAboveArrayLocation = { y: this.arrayUnit.y() - this.resultItem.height() - 8 };
    // move arr acc instruction and index to above array
    await Promise.all([
      this.arrayItemAnimation.animateTo({ opacity: 0 }, { duration: 0.6 }),
      this.arrayArrowAnimation.animateTo({ opacity: 0 }, { duration: 0.6 }),
      this.accessorAnimation.animateRectTo({ stroke: defaultStrokeColor() }, { duration: 1.2 }),
      this.accessorAnimation.animateTo(
        {
          x: indexAboveArrayLocation.x - minInstrItemWidth,
          y: indexAboveArrayLocation.y,
          width: minInstrItemWidth
        },
        { duration: 1.2 }
      ),
      this.indexItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }, { duration: 1.2 }),
      this.indexItemAnimation.animateTo(indexAboveArrayLocation, { duration: 1.2 })
    ]);
    // Move arr acc instruction and result on top of array, and bring result up
    await Promise.all([
      this.accessorAnimation.animateTo({ opacity: 0 }, { duration: 0.8 }),
      this.accessorAnimation.animateTo(indexInArrayLocation),
      this.indexItemAnimation.animateTo({ opacity: 0 }, { duration: 0.8 }),
      this.indexItemAnimation.animateTo(indexInArrayLocation),
      this.resultAnimation.animateTo(resultAboveArrayLocation),
      this.resultAnimation.animateTo({ opacity: 1 }, { duration: 0.8, delay: 0.2 })
    ]);
    // Move result into stash
    await Promise.all([
      this.resultAnimation.animateTo(getNodeLocation(this.resultItem), { duration: 1.2 }),
      isStashItemInDanger(this.resultItem.index) &&
        this.resultAnimation.animateRectTo({ stroke: defaultDangerColor() }, { duration: 1.2 }),
      this.resultArrowAnimation?.animateTo({ opacity: 1 }, { delay: 1 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.resultItem.ref.current?.show();
    this.resultItem.arrow?.ref.current?.show();
    this.accessorAnimation.destroy();
    this.arrayItemAnimation.destroy();
    this.indexItemAnimation.destroy();
    this.resultAnimation.destroy();
    this.resultArrowAnimation?.destroy();
  }
}
