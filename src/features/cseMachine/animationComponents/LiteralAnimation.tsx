import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { Animatable } from './base/Animatable';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

export class LiteralAnimation extends Animatable {
  private borderRectAnimation: AnimatedRectComponent;
  private controlTextAnimation: AnimatedTextComponent;
  private stackTextAnimation?: AnimatedTextComponent;
  private textChanged: boolean;

  constructor(
    controlItem: ControlItemComponent,
    private stashItem: StashItemComponent
  ) {
    super();
    const controlPosition = getNodePosition(controlItem);
    this.borderRectAnimation = new AnimatedRectComponent(controlPosition);
    this.controlTextAnimation = new AnimatedTextComponent({
      ...controlPosition,
      text: controlItem.text,
      padding: Number(ControlStashConfig.ControlItemTextPadding)
    });
    this.textChanged = controlItem.text !== stashItem.text;
    if (this.textChanged) {
      this.stackTextAnimation = new AnimatedTextComponent({
        ...controlPosition,
        text: stashItem.text,
        padding: Number(ControlStashConfig.StashItemTextPadding),
        opacity: 0
      });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.borderRectAnimation.draw()}
        {this.controlTextAnimation.draw()}
        {this.stackTextAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.stashItem.ref.current.hide();
    const stashPosition = getNodePosition(this.stashItem);
    await Promise.all([
      this.borderRectAnimation.animateTo(stashPosition),
      this.controlTextAnimation.animateTo(stashPosition),
      // If the text is different, also fade out the old text and fade in the new text
      ...(this.textChanged
        ? [
            this.controlTextAnimation.animateTo({ opacity: 0 }, { duration: 0.5, delay: 0.2 }),
            this.stackTextAnimation!.animateTo(stashPosition),
            this.stackTextAnimation!.animateTo({ opacity: 1 }, { duration: 0.5, delay: 0.5 })
          ]
        : [])
    ]);
    this.destroy();
  }

  destroy() {
    this.stashItem.ref.current?.show();
    this.ref.current?.hide();
    this.borderRectAnimation.destroy();
    this.controlTextAnimation.destroy();
    this.stackTextAnimation?.destroy();
  }
}
