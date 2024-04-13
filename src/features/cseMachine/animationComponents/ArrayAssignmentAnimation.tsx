import React from 'react';
import { Group } from 'react-konva';

import { ArrayUnit } from '../components/ArrayUnit';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Text } from '../components/Text';
import { ArrayValue } from '../components/values/ArrayValue';
import { PrimitiveValue } from '../components/values/PrimitiveValue';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import {
  defaultActiveColor,
  defaultDangerColor,
  defaultStrokeColor,
  getTextWidth
} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

/** Animation for array assignment */
export class ArrayAssignmentAnimation extends Animatable {
  // Control item
  private asgnItemAnimation: AnimatedTextbox;

  // Stash items
  private arrayItemAnimation: AnimatedTextbox;
  private arrayArrowAnimation: AnimatedGenericArrow<StashItemComponent, Visible>;
  private indexItemAnimation: AnimatedTextbox;
  private valueArrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;
  private resultAnimation: AnimatedTextbox;
  private resultArrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;

  // Value inside array unit
  private arrayUnitText?: Text;
  private arrayUnitTextAnimation?: AnimatedTextComponent;
  private arrayUnitArrowAnimation?: AnimatedGenericArrow<ArrayUnit, Visible>;

  private arrayUnit: ArrayUnit;
  private resultItemIsFirst: boolean;

  constructor(
    private asgnItem: ControlItemComponent,
    arrayItem: StashItemComponent,
    arrayValue: ArrayValue,
    indexItem: StashItemComponent,
    valueItem: StashItemComponent,
    private resultItem: StashItemComponent
  ) {
    super();
    this.resultItemIsFirst = resultItem.index === 0;
    this.asgnItemAnimation = new AnimatedTextbox(asgnItem.text, getNodePosition(asgnItem), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.arrayItemAnimation = new AnimatedTextbox(arrayItem.text, getNodePosition(arrayItem), {
      rectProps: { stroke: defaultDangerColor() }
    });
    this.arrayArrowAnimation = new AnimatedGenericArrow(arrayItem.arrow!);
    this.indexItemAnimation = new AnimatedTextbox(indexItem.text, getNodePosition(indexItem), {
      rectProps: { stroke: defaultDangerColor() }
    });
    // valueItem and resultItem should be the same
    this.resultAnimation = new AnimatedTextbox(resultItem.text, getNodePosition(valueItem), {
      rectProps: { stroke: defaultDangerColor() }
    });
    if (valueItem.arrow) this.valueArrowAnimation = new AnimatedGenericArrow(valueItem.arrow);
    if (resultItem.arrow) {
      this.resultArrowAnimation = new AnimatedGenericArrow(resultItem.arrow, { opacity: 0 });
    }
    this.arrayUnit = arrayValue.units[parseInt(indexItem.text)];
    if (
      this.arrayUnit.value instanceof PrimitiveValue &&
      this.arrayUnit.value.text instanceof Text
    ) {
      this.arrayUnitText = this.arrayUnit.value.text;
      this.arrayUnitTextAnimation = new AnimatedTextComponent({
        text: this.arrayUnitText.partialStr,
        x: this.arrayUnitText.x(),
        y: this.arrayUnitText.y() - 16,
        opacity: 0
      });
    }
  }

  draw(): React.ReactNode {
    // Arrow only gets updated when drawn, so animated arrow is initialised here instead
    if (this.arrayUnit.arrow) {
      this.arrayUnitArrowAnimation = new AnimatedGenericArrow(this.arrayUnit.arrow, {
        opacity: 0,
        y: -16
      });
    }
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.asgnItemAnimation.draw()}
        {this.arrayItemAnimation.draw()}
        {this.arrayArrowAnimation.draw()}
        {this.indexItemAnimation.draw()}
        {this.valueArrowAnimation?.draw()}
        {this.resultAnimation.draw()}
        {this.resultArrowAnimation?.draw()}
        {this.arrayUnitTextAnimation?.draw()}
        {this.arrayUnitArrowAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current?.hide();
    this.resultItem.arrow?.ref.current?.hide();
    this.arrayUnitText?.ref.current?.hide();
    this.arrayUnit.arrow?.ref.current?.hide();
    const minAsgnItemWidth =
      getTextWidth(this.asgnItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    const fadeConfig = { duration: 3 / 4 };
    // move the instruction next to stash while merging stash items
    await Promise.all([
      this.arrayArrowAnimation.animateTo({ opacity: 0 }, { duration: 0.5 }),
      this.valueArrowAnimation?.animateTo({ opacity: 0 }, { duration: 0.5 }),
      this.asgnItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.asgnItemAnimation.animateTo({
        x: this.resultItem.x() - (this.resultItemIsFirst ? minAsgnItemWidth : 0),
        y: this.resultItem.y() + (this.resultItemIsFirst ? 0 : this.resultItem.height()),
        width: minAsgnItemWidth
      }),
      this.arrayItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.arrayItemAnimation.animateTo({ opacity: 0 }, fadeConfig),
      this.indexItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.indexItemAnimation.animateTo({ x: this.resultItem.x() }),
      this.indexItemAnimation.animateTo({ opacity: 0 }, fadeConfig),
      this.resultAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.resultAnimation.animateTo({ x: this.resultItem.x() }),
      this.resultArrowAnimation?.animateTo({ opacity: 1 }, { duration: 0.5, delay: 0.75 })
    ]);
    this.resultItem.ref.current?.show();
    this.resultItem.arrow?.ref.current?.show();
    this.resultArrowAnimation?.destroy();
    const aboveArrayLocation = {
      x: this.arrayUnit.x() + this.arrayUnit.width() / 2 - this.resultItem.width() / 2,
      y: this.arrayUnit.y() - this.resultItem.height() - 8
    };
    const inArrayLocation = {
      y: this.arrayUnit.y() + this.arrayUnit.height() / 2 - this.resultItem.height() / 2
    };
    // move instruction and a copy of the value to above the array
    await Promise.all([
      this.asgnItemAnimation.animateTo(
        {
          x: aboveArrayLocation.x - minAsgnItemWidth,
          y: aboveArrayLocation.y
        },
        { duration: 1.2 }
      ),
      this.resultAnimation.animateTo(aboveArrayLocation, { duration: 1.2 })
    ]);
    // insert value into array
    await Promise.all([
      this.asgnItemAnimation.animateTo(inArrayLocation),
      this.asgnItemAnimation.animateTo({ opacity: 0 }, fadeConfig),
      this.resultAnimation.animateTo(inArrayLocation),
      this.resultAnimation.animateTo({ opacity: 0 }, fadeConfig),
      this.arrayUnitTextAnimation?.animateTo({ y: this.arrayUnitText!.y() }),
      this.arrayUnitTextAnimation?.animateTo({ opacity: 1 }, { ...fadeConfig, delay: 1 / 4 }),
      this.arrayUnitArrowAnimation?.animateTo({ y: 0 }),
      this.arrayUnitArrowAnimation?.animateTo({ opacity: 1 }, { ...fadeConfig, delay: 1 / 4 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.resultItem.ref.current?.show();
    this.resultItem.arrow?.ref.current?.show();
    this.arrayUnitText?.ref.current?.show();
    this.arrayUnit.arrow?.ref.current?.show();
    this.asgnItemAnimation.destroy();
    this.arrayItemAnimation.destroy();
    this.arrayArrowAnimation.destroy();
    this.indexItemAnimation.destroy();
    this.valueArrowAnimation?.destroy();
    this.resultAnimation.destroy();
    this.resultArrowAnimation?.destroy();
    this.arrayUnitTextAnimation?.destroy();
    this.arrayUnitArrowAnimation?.destroy();
  }
}
