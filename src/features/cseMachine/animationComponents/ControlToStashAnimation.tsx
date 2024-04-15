import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import {
  defaultActiveColor,
  defaultDangerColor,
  defaultStrokeColor,
  isStashItemInDanger
} from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

/**
 * Animation for any single item movement from control to stash.
 * Used for literals and arrow function expressions
 */
export class ControlToStashAnimation extends Animatable {
  private borderRectAnimation: AnimatedRectComponent;
  private controlTextAnimation: AnimatedTextComponent;
  private stackTextAnimation?: AnimatedTextComponent;
  private arrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;
  private textChanged: boolean;

  constructor(
    controlItem: ControlItemComponent,
    private stashItem: StashItemComponent
  ) {
    super();
    const controlPosition = getNodePosition(controlItem);
    this.borderRectAnimation = new AnimatedRectComponent({
      ...controlPosition,
      stroke: defaultActiveColor()
    });
    this.controlTextAnimation = new AnimatedTextComponent({
      ...controlPosition,
      text: controlItem.text,
      padding: ControlStashConfig.ControlItemTextPadding
    });
    this.textChanged = controlItem.text !== stashItem.text;
    if (this.textChanged) {
      this.stackTextAnimation = new AnimatedTextComponent({
        ...controlPosition,
        text: stashItem.text,
        padding: ControlStashConfig.StashItemTextPadding,
        opacity: 0
      });
    }
    if (this.stashItem.arrow) {
      this.arrowAnimation = new AnimatedGenericArrow(this.stashItem.arrow, { opacity: 0 });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.borderRectAnimation.draw()}
        {this.controlTextAnimation.draw()}
        {this.stackTextAnimation?.draw()}
        {this.arrowAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.stashItem.ref.current?.hide();
    this.stashItem.arrow?.ref.current.hide();
    const stashPosition = getNodePosition(this.stashItem);
    await Promise.all([
      this.borderRectAnimation.animateTo({
        ...stashPosition,
        stroke: isStashItemInDanger(this.stashItem.index)
          ? defaultDangerColor()
          : defaultStrokeColor()
      }),
      this.controlTextAnimation.animateTo(stashPosition),
      // If the text is different, also fade out the old text and fade in the new text
      ...(this.textChanged
        ? [
            this.controlTextAnimation.animateTo({ opacity: 0 }, { duration: 0.5, delay: 0.2 }),
            this.stackTextAnimation!.animateTo(stashPosition),
            this.stackTextAnimation!.animateTo({ opacity: 1 }, { duration: 0.5, delay: 0.5 })
          ]
        : []),
      this.arrowAnimation?.animateTo({ opacity: 1 }, { delay: 1 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.stashItem.ref.current?.show();
    this.stashItem.arrow?.ref.current?.show();
    this.borderRectAnimation.destroy();
    this.controlTextAnimation.destroy();
    this.stackTextAnimation?.destroy();
    this.arrowAnimation?.destroy();
  }
}
