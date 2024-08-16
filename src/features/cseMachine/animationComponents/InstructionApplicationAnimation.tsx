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
  getTextWidth,
  isStashItemInDanger
} from '../CseMachineUtils';
import { Animatable, AnimationConfig } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

/**
 * Animation for control instructions that combines the previous stash items into a new stash result.
 *
 * Instructions include `array lit=`, `call` (for built-in functions)
 */
export class InstructionApplicationAnimation extends Animatable {
  private controlInstrAnimation: AnimatedTextbox; // the array literal control item
  private stashItemAnimations: AnimatedTextbox[];
  private resultAnimation: AnimatedTextbox;
  private arrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;

  private endX: number;
  private resultItemIsFirst: boolean;

  constructor(
    private controlInstrItem: ControlItemComponent,
    private stashItems: StashItemComponent[],
    private resultItem: StashItemComponent
  ) {
    super();
    this.resultItemIsFirst = (resultItem?.index ?? stashItems[0].index) === 0;
    this.endX = stashItems.at(-1)!.x() + stashItems.at(-1)!.width();
    this.controlInstrAnimation = new AnimatedTextbox(
      controlInstrItem.text,
      getNodePosition(controlInstrItem),
      { rectProps: { stroke: defaultActiveColor() } }
    );
    this.stashItemAnimations = stashItems.map(item => {
      return new AnimatedTextbox(item.text, getNodePosition(item), {
        rectProps: {
          stroke: isStashItemInDanger(item.index) ? defaultDangerColor() : defaultStrokeColor()
        }
      });
    });
    this.resultAnimation = new AnimatedTextbox(resultItem.text, {
      ...getNodePosition(resultItem),
      opacity: 0
    });
    if (resultItem.arrow) {
      this.arrowAnimation = new AnimatedGenericArrow(resultItem.arrow, { opacity: 0 });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.controlInstrAnimation.draw()}
        {this.stashItemAnimations.map(a => a.draw())}
        {this.resultAnimation.draw()}
        {this.arrowAnimation?.draw()}
      </Group>
    );
  }

  async animate(animationConfig?: AnimationConfig) {
    this.resultItem?.ref.current?.hide();
    this.resultItem?.arrow?.ref.current?.hide();
    const minInstrWidth =
      getTextWidth(this.controlInstrItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    const resultX = this.resultItem?.x() ?? this.stashItems[0].x();
    const resultY = this.resultItem?.y() ?? this.stashItems[0].y();
    const startX = resultX - (this.resultItemIsFirst ? minInstrWidth : 0);
    const fadeDuration = ((animationConfig?.duration ?? 1) * 3) / 4;
    const fadeInDelay = (animationConfig?.delay ?? 0) + (animationConfig?.duration ?? 1) / 4;
    // Move array literal instruction next to stash items
    await Promise.all([
      this.resultAnimation.animateTo(
        { x: startX + (this.endX - startX) / 2 - this.resultItem!.width() / 2 },
        { duration: 0 }
      ),
      this.controlInstrAnimation.animateRectTo({ stroke: defaultStrokeColor() }, animationConfig),
      this.controlInstrAnimation.animateTo(
        {
          x: startX,
          y:
            resultY +
            (this.resultItemIsFirst
              ? 0
              : (this.resultItem?.height() ?? this.stashItems[0].height())),
          width: minInstrWidth
        },
        animationConfig
      ),
      ...this.stashItemAnimations.map(a =>
        a.animateRectTo({ stroke: defaultStrokeColor() }, animationConfig)
      )
    ]);
    animationConfig = { ...animationConfig, delay: 0 };
    // Merge all elements together to form the result
    await Promise.all([
      this.controlInstrAnimation.animateTo({ x: resultX, y: resultY }, animationConfig),
      this.controlInstrAnimation.animateTo(
        { opacity: 0 },
        { ...animationConfig, duration: fadeDuration }
      ),
      ...this.stashItemAnimations.flatMap(a => [
        a.animateTo({ x: resultX }, animationConfig),
        a.animateTo({ opacity: 0 }, { ...animationConfig, duration: fadeDuration })
      ]),
      this.resultAnimation?.animateTo({ x: resultX }, animationConfig),
      isStashItemInDanger(this.resultItem.index) &&
        this.resultAnimation?.animateRectTo({ stroke: defaultDangerColor() }, animationConfig),
      this.resultAnimation?.animateTo(
        { opacity: 1 },
        { ...animationConfig, duration: fadeDuration, delay: fadeInDelay }
      ),
      this.arrowAnimation?.animateTo(
        { opacity: 1 },
        { ...animationConfig, delay: animationConfig?.duration ?? 1 }
      )
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.resultItem.ref.current?.show();
    this.resultItem.arrow?.ref.current?.show();
    this.controlInstrAnimation.destroy();
    this.stashItemAnimations.map(a => a.destroy());
    this.resultAnimation.destroy();
    this.arrowAnimation?.destroy();
  }
}
