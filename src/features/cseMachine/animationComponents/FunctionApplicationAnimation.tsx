import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { Visible } from '../components/Visible';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { defaultActiveColor, getTextWidth } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeLocation, getNodePosition } from './base/AnimationUtils';
import { FrameCreationAnimation } from './FrameCreationAnimation';

export class FunctionApplicationAnimation extends Animatable {
  private callInstrAnimation: AnimatedTextbox;
  private stashItemAnimations: AnimatedTextbox[];
  private closureArrowAnimation: AnimatedGenericArrow<StashItemComponent, Visible>;
  private newControlItemAnimations: AnimatedTextbox[];
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
      getNodePosition(callInstrItem)
    );
    this.stashItemAnimations = [
      new AnimatedTextbox(closureStashItem.text, getNodePosition(closureStashItem)),
      ...argStashItems.map(item => new AnimatedTextbox(item.text, getNodePosition(item)))
    ];
    this.closureArrowAnimation = new AnimatedGenericArrow(closureStashItem.arrow!);
    this.newControlItemAnimations = newControlItems.map(
      i => new AnimatedTextbox(i.text, { ...closureLocation, opacity: 0 })
    );
    if (functionFrame) {
      this.frameCreationAnimation = new FrameCreationAnimation(closureStashItem, functionFrame);
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.callInstrAnimation.draw()}
        {this.stashItemAnimations.map(a => a.draw())}
        {this.closureArrowAnimation.draw()}
        {this.newControlItemAnimations.map(a => a.draw())}
        {this.frameCreationAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.newControlItems.forEach(item => item.ref.current?.hide());
    // hide the function frame before the frame creation animation plays
    this.functionFrame?.ref.current?.hide();

    const minInstrWidth =
      getTextWidth(this.callInstrItem.text) + ControlStashConfig.ControlItemTextPadding * 2;
    // Move call instruction next to stash items
    await this.callInstrAnimation.animateTo({
      x: this.closureStashItem.x() - (this.isFirstStashItem ? minInstrWidth : 0),
      y: this.closureStashItem.y() + (this.isFirstStashItem ? 0 : this.closureStashItem.height()),
      width: minInstrWidth
    });
    const targetLocation = {
      x: this.functionFrame?.x() ?? this.newControlItems[0].x(),
      y: this.functionFrame?.y() ?? this.newControlItems[0].y()
    };
    const config = { duration: 1.5 };
    const fadeDuration = 9 / 8;
    const fadeInDelay = 3 / 8;
    // merge all items together while also creating the new frame and new control items
    await Promise.all([
      this.closureArrowAnimation.animateTo({ opacity: 0 }, { duration: 0.5 }),
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
      this.frameCreationAnimation?.animate(config)
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.newControlItems.forEach(item => item.ref.current?.show());
    this.functionFrame?.ref.current?.show();
    this.callInstrAnimation.destroy();
    this.stashItemAnimations.forEach(a => a.destroy());
    this.closureArrowAnimation.destroy();
    this.newControlItemAnimations.forEach(a => a.destroy());
    this.frameCreationAnimation?.destroy();
  }
}
