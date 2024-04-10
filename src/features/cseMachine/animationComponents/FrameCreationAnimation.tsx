import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { Config } from '../CseMachineConfig';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor } from '../CseMachineUtils';
import { Animatable, AnimationConfig } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodeDimensions, getNodeLocation, getNodePosition } from './base/AnimationUtils';

export class FrameCreationAnimation extends Animatable {
  private controlTextAnimation: AnimatedTextComponent;
  private borderAnimation: AnimatedRectComponent;
  private frameArrowAnimation?: AnimatedGenericArrow<Frame, Frame>;
  private frameNameAnimation: AnimatedTextComponent;
  private frameBindingsAnimation: AnimatedTextComponent[];

  constructor(
    origin: ControlItemComponent | StashItemComponent,
    private frame: Frame
  ) {
    super();
    const xDiff = frame.x() - origin.x();
    const yDiff = frame.y() - origin.y();
    this.controlTextAnimation = new AnimatedTextComponent({
      ...getNodePosition(origin),
      text: origin.text,
      padding:
        origin instanceof ControlItemComponent
          ? Number(ControlStashConfig.ControlItemTextPadding)
          : Number(ControlStashConfig.StashItemTextPadding)
    });
    this.borderAnimation = new AnimatedRectComponent({
      ...getNodePosition(origin),
      stroke: origin instanceof ControlItemComponent ? defaultActiveColor() : defaultStrokeColor()
    });
    if (frame.arrow) {
      this.frameArrowAnimation = new AnimatedGenericArrow(frame.arrow, { opacity: 0 });
    }
    this.frameNameAnimation = new AnimatedTextComponent({
      text: frame.name.partialStr,
      ...getNodeDimensions(frame.name),
      x: frame.name.x() - xDiff,
      y: frame.name.y() - yDiff,
      opacity: 0
    });
    this.frameBindingsAnimation = frame.bindings.map(binding => {
      return new AnimatedTextComponent({
        text: binding.keyString,
        ...getNodeDimensions(binding.key),
        x: binding.key.x() - xDiff,
        y: binding.key.y() - yDiff,
        opacity: 0
      });
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.controlTextAnimation.draw()}
        {this.borderAnimation.draw()}
        {this.frameArrowAnimation?.draw()}
        {this.frameNameAnimation.draw()}
        {this.frameBindingsAnimation.map(a => a.draw())}
      </Group>
    );
  }

  async animate(animationConfig?: AnimationConfig) {
    this.frame.ref.current.hide();
    const duration = animationConfig?.duration ?? 1.2;
    const translateConfig = { ...animationConfig, duration };
    const fadeOutConfig = { ...animationConfig, duration: (duration * 3) / 4 };
    const fadeInConfig = {
      duration: (duration * 3) / 4,
      delay: duration / 4 + (animationConfig?.delay ?? 0),
      easing: animationConfig?.easing
    };
    const framePosition = getNodePosition(this.frame);
    await Promise.all([
      // Fade out the control text during translation
      this.controlTextAnimation.animateTo({ opacity: 0 }, fadeOutConfig),
      // Move everything towards the frame position
      this.controlTextAnimation.animateTo(getNodeLocation(this.frame), translateConfig),
      this.borderAnimation.animateTo(
        { ...framePosition, cornerRadius: Number(Config.FrameCornerRadius) },
        translateConfig
      ),
      this.frameNameAnimation.animateTo(getNodePosition(this.frame.name), translateConfig),
      // Also fade frame items in during translation
      ...this.frameBindingsAnimation.flatMap((a, i) => [
        a.animateTo(getNodeLocation(this.frame.bindings[i]), translateConfig),
        a.animateTo({ opacity: 1 }, fadeInConfig)
      ]),
      this.frameNameAnimation.animateTo({ opacity: 1 }, fadeInConfig),
      // Fade in the arrow last
      this.frameArrowAnimation?.animateTo(
        { opacity: 1 },
        { duration: 0.5, delay: duration + (animationConfig?.delay ?? 0) }
      )
    ]);
    this.destroy();
  }

  destroy() {
    this.frame.ref.current?.show();
    this.controlTextAnimation.destroy();
    this.borderAnimation.destroy();
    this.frameArrowAnimation?.destroy();
    this.frameNameAnimation.destroy();
    this.frameBindingsAnimation.forEach(a => a.destroy());
  }
}
