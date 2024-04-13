import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
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
import { getNodeLocation, getNodePosition } from './base/AnimationUtils';
import { FrameCreationAnimation } from './FrameCreationAnimation';

/**
 * Animation for function application. Visually moves the resultant items out of the stash
 * into position somewhere in the control or environment.
 *
 * Used when a function is called, specifically the 'APPLICATION' instruction.
 */
export class FunctionApplicationAnimation extends Animatable {
  private callInstrAnimation: AnimatedTextbox;
  private stashItemAnimations: AnimatedTextbox[];
  private stashArrowAnimations: AnimatedGenericArrow<StashItemComponent, Visible>[];
  private newControlItemAnimations: AnimatedTextbox[];
  private envArrowAnimation?: AnimatedGenericArrow<ControlItemComponent, Visible>;
  private frameCreationAnimation?: FrameCreationAnimation;

  private isFirstStashItem: boolean;

  constructor(
    private callInstrItem: ControlItemComponent,
    private newControlItems: ControlItemComponent[],
    private closureStashItem: StashItemComponent,
    argStashItems: StashItemComponent[],
    private functionFrame?: Frame
  ) {
    super();
    const closureLocation = getNodeLocation(closureStashItem);
    this.isFirstStashItem = closureStashItem.index === 0;
    this.callInstrAnimation = new AnimatedTextbox(
      callInstrItem.text,
      getNodePosition(callInstrItem),
      { rectProps: { stroke: defaultActiveColor() } }
    );
    this.stashItemAnimations = [
      new AnimatedTextbox(closureStashItem.text, getNodePosition(closureStashItem), {
        rectProps: { stroke: defaultDangerColor() }
      }),
      ...argStashItems.map(item => {
        return new AnimatedTextbox(item.text, getNodePosition(item), {
          rectProps: { stroke: defaultDangerColor() }
        });
      })
    ];
    this.stashArrowAnimations = [
      new AnimatedGenericArrow(closureStashItem.arrow!),
      ...argStashItems.flatMap(item => (item.arrow ? new AnimatedGenericArrow(item.arrow) : []))
    ];
    this.newControlItemAnimations = newControlItems.map(
      i => new AnimatedTextbox(i.text, { ...closureLocation, opacity: 0 })
    );
    if (this.newControlItems[0].arrow) {
      this.envArrowAnimation = new AnimatedGenericArrow(this.newControlItems[0].arrow, {
        opacity: 0
      });
    }
    if (functionFrame) {
      this.frameCreationAnimation = new FrameCreationAnimation(closureStashItem, functionFrame);
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.callInstrAnimation.draw()}
        {this.stashItemAnimations.map(a => a.draw())}
        {this.stashArrowAnimations.map(a => a.draw())}
        {this.newControlItemAnimations.map(a => a.draw())}
        {this.envArrowAnimation?.draw()}
        {this.frameCreationAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.newControlItems.forEach(item => item.ref.current?.hide());
    this.newControlItems[0].arrow?.ref.current?.hide();
    // hide the function frame before the frame creation animation plays
    this.functionFrame?.ref.current?.hide();

    const minInstrWidth =
      getTextWidth(this.callInstrItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    // Move call instruction next to stash items
    await Promise.all([
      this.callInstrAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.callInstrAnimation.animateTo({
        x: this.closureStashItem.x() - (this.isFirstStashItem ? minInstrWidth : 0),
        y: this.closureStashItem.y() + (this.isFirstStashItem ? 0 : this.closureStashItem.height()),
        width: minInstrWidth
      }),
      ...this.stashItemAnimations.map(a => a.animateRectTo({ stroke: defaultStrokeColor() }))
    ]);
    const targetLocation = {
      x: this.functionFrame?.x() ?? this.newControlItems[0].x(),
      y: this.functionFrame?.y() ?? this.newControlItems[0].y()
    };
    const config = { duration: 1.2 };
    const fadeDuration = 9 / 8;
    const fadeInDelay = 3 / 8;
    // merge all items together while also creating the new frame and new control items
    await Promise.all([
      this.stashArrowAnimations.map(a => a.animateTo({ opacity: 0 }, { duration: 0.5 })),
      this.callInstrAnimation.animateTo(targetLocation, config),
      this.callInstrAnimation.animateTo({ opacity: 0 }, { ...config, duration: fadeDuration }),
      ...this.stashItemAnimations.flatMap(a => [
        a.animateTo(targetLocation, config),
        a.animateTo({ opacity: 0 }, { ...config, duration: fadeDuration })
      ]),
      ...this.newControlItemAnimations.flatMap((a, i) => [
        a.animateTo(getNodePosition(this.newControlItems[i]), config),
        a.animateTo({ opacity: 1 }, { ...config, duration: fadeDuration, delay: fadeInDelay })
      ]),
      this.newControlItemAnimations.at(-1)!.animateRectTo({ stroke: defaultActiveColor() }, config),
      this.frameCreationAnimation?.animate(config),
      this.envArrowAnimation?.animateTo({ opacity: 1 }, { delay: config.duration })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.newControlItems.forEach(item => item.ref.current?.show());
    this.newControlItems[0].arrow?.ref.current?.show();
    this.functionFrame?.ref.current?.show();
    this.callInstrAnimation.destroy();
    this.stashItemAnimations.forEach(a => a.destroy());
    this.stashArrowAnimations.forEach(a => a.destroy());
    this.newControlItemAnimations.forEach(a => a.destroy());
    this.frameCreationAnimation?.destroy();
  }
}
