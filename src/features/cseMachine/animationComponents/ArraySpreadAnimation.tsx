//import { Easings } from 'konva/lib/Tween';
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
  getTextWidth
} from '../CseMachineUtils';
import { Animatable, AnimationConfig } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

/**
 * Adapted from InstructionApplicationAnimation, but changed resultAnimation to [], among others
 */
export class ArraySpreadAnimation extends Animatable {
  private controlInstrAnimation: AnimatedTextbox; // the array literal control item
  private stashItemAnimation: AnimatedTextbox;
  private resultAnimations: AnimatedTextbox[];
  private arrowAnimation?: AnimatedGenericArrow<StashItemComponent, Visible>;
  private currCallInstrAnimation: AnimatedTextbox;

  private endX: number;

  constructor(
    private controlInstrItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private resultItems: StashItemComponent[],
    private currCallInstrItem: ControlItemComponent
  ) {
    super();

    this.endX = stashItem!.x() + stashItem!.width();
    this.controlInstrAnimation = new AnimatedTextbox(
      controlInstrItem.text,
      getNodePosition(controlInstrItem),
      { rectProps: { stroke: defaultActiveColor() } }
    );
    this.stashItemAnimation = new AnimatedTextbox(stashItem.text, getNodePosition(stashItem), {
      rectProps: {
        stroke: defaultDangerColor()
      }
    });

    // call instr above
    this.currCallInstrAnimation = new AnimatedTextbox(
      this.currCallInstrItem.text,
      getNodePosition(this.currCallInstrItem),
      { rectProps: { stroke: defaultActiveColor() } }
    );

    this.resultAnimations = resultItems.map(item => {
      return new AnimatedTextbox(item.text, {
        ...getNodePosition(item),
        opacity: 0
      });
    });
    if (stashItem.arrow) {
      this.arrowAnimation = new AnimatedGenericArrow(stashItem.arrow, { opacity: 0 });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.controlInstrAnimation.draw()}
        {this.stashItemAnimation.draw()}
        {this.currCallInstrAnimation.draw()}
        {this.resultAnimations.map(a => a.draw())}
        {this.arrowAnimation?.draw()}
      </Group>
    );
  }

  async animate(animationConfig?: AnimationConfig) {
    this.resultItems?.map(a => a.ref.current?.hide());
    this.resultItems?.map(a => a.arrow?.ref.current?.hide());
    const minInstrWidth =
      getTextWidth(this.controlInstrItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    const resultX = (idx: number) => this.resultItems[idx]?.x() ?? this.stashItem.x();
    const resultY = this.resultItems[0]?.y() ?? this.stashItem.y();
    const startX = resultX(0);
    const fadeDuration = ((animationConfig?.duration ?? 1) * 3) / 4;
    const fadeInDelay = (animationConfig?.delay ?? 0) + (animationConfig?.duration ?? 1) / 4;

    // Move spread instruction next to stash item (array pointer)
    await Promise.all([
      ...this.resultAnimations.flatMap(a => [
        a.animateTo(
          { x: startX + (this.endX - startX) / 2 - this.resultItems[0]?.width() / 2 },
          { duration: 0 }
        )
      ]),
      this.controlInstrAnimation.animateRectTo({ stroke: defaultStrokeColor() }, animationConfig),
      this.controlInstrAnimation.animateTo(
        {
          x: startX,
          y: resultY + (this.resultItems[0]?.height() ?? this.stashItem.height()),
          width: minInstrWidth
        },
        animationConfig
      ),
      this.stashItemAnimation.animateRectTo({ stroke: defaultDangerColor() }, animationConfig)
    ]);

    animationConfig = { ...animationConfig, delay: 0 };
    // Merge all elements together to form the result
    await Promise.all([
      this.controlInstrAnimation.animateTo({ x: resultX(0), y: resultY }, animationConfig),
      this.controlInstrAnimation.animateTo(
        { opacity: 0 },
        { ...animationConfig, duration: fadeDuration }
      ),
      this.stashItemAnimation.animateTo({ x: resultX(0) }, animationConfig),
      this.stashItemAnimation.animateTo(
        { opacity: 0 },
        { ...animationConfig, duration: fadeDuration }
      ),

      ...this.resultAnimations.flatMap((a, idx) => [
        a.animateTo({ x: resultX(idx) }, animationConfig),
        a.animateRectTo({ stroke: defaultDangerColor() }, animationConfig),
        a.animateTo(
          { opacity: 1 },
          { ...animationConfig, duration: fadeDuration, delay: fadeInDelay }
        )
      ])
    ]);

    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.resultItems.map(a => a.ref.current?.show());
    this.resultItems.map(a => a.arrow?.ref.current?.show());
    this.controlInstrAnimation.destroy();
    this.stashItemAnimation.destroy();
    this.resultAnimations.map(a => a.destroy());
    this.arrowAnimation?.destroy();
  }
}
