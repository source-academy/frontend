import React from 'react';
import { Group } from 'react-konva';

import { GenericArrow } from '../components/arrows/GenericArrow';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { Text } from '../components/Text';
import { ArrayValue } from '../components/values/ArrayValue';
import { PrimitiveValue } from '../components/values/PrimitiveValue';
import { Value } from '../components/values/Value';
import { CseAnimation } from '../CseMachineAnimation';
import { Config } from '../CseMachineConfig';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor, isEnvEqual } from '../CseMachineUtils';
import { Animatable, AnimationConfig } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodeDimensions, getNodeLocation, getNodePosition } from './base/AnimationUtils';

export class FrameCreationAnimation extends Animatable {
  readonly controlTextAnimation: AnimatedTextComponent;
  readonly borderAnimation: AnimatedRectComponent;
  private frameArrowAnimation?: AnimatedGenericArrow<Frame, Frame>;
  private frameNameAnimation: AnimatedTextComponent;
  private frameBindingKeyAnimations: AnimatedTextComponent[];
  private frameValues: PrimitiveValue[];
  private frameValueAnimations: AnimatedTextComponent[];
  private frameArrows: GenericArrow<Text, Value>[];
  private frameArrowAnimations: AnimatedGenericArrow<Text, Value>[];
  private variadicArray?: ArrayValue;

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
          ? ControlStashConfig.ControlItemTextPadding
          : ControlStashConfig.StashItemTextPadding,
      opacity: origin instanceof ControlItemComponent ? 1 : 0
    });
    this.borderAnimation = new AnimatedRectComponent({
      ...getNodePosition(origin),
      stroke: origin instanceof ControlItemComponent ? defaultActiveColor() : defaultStrokeColor(),
      opacity: origin instanceof ControlItemComponent ? 1 : 0
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
    this.frameBindingKeyAnimations = frame.bindings.map(binding => {
      return new AnimatedTextComponent({
        text: binding.keyString,
        ...getNodeDimensions(binding.key),
        x: binding.key.x() - xDiff,
        y: binding.key.y() - yDiff,
        opacity: 0
      });
    });
    this.frameValues = frame.bindings.flatMap(binding =>
      binding.value instanceof PrimitiveValue ? binding.value : []
    );
    this.frameValueAnimations = this.frameValues.map(value => {
      return new AnimatedTextComponent({
        text: (value.text as Text).partialStr,
        ...getNodeDimensions(value),
        x: value.x() - xDiff,
        y: value.y() - yDiff,
        opacity: 0
      });
    });
    this.frameArrows = frame.bindings.flatMap(binding => {
      if (
        binding.value instanceof ArrayValue &&
        isEnvEqual(binding.value.data.environment, this.frame.environment)
      ) {
        this.variadicArray = binding.value;
      }
      return binding.arrow ?? [];
    });
    this.frameArrowAnimations = this.frameArrows.map(arrow => {
      return new AnimatedGenericArrow(arrow, {
        x: -xDiff,
        y: -yDiff,
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
        {this.frameBindingKeyAnimations.map(a => a.draw())}
        {this.frameValueAnimations.map(a => a.draw())}
        {this.frameArrowAnimations.map(a => a.draw())}
      </Group>
    );
  }

  async animate(animationConfig?: AnimationConfig) {
    this.frame.ref.current?.hide();
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
        {
          ...framePosition,
          stroke: defaultActiveColor(),
          opacity: 1,
          cornerRadius: Number(Config.FrameCornerRadius)
        },
        translateConfig
      ),
      this.frameNameAnimation.animateTo(getNodePosition(this.frame.name), translateConfig),
      // Also fade frame items in during translation
      ...this.frameBindingKeyAnimations.flatMap((a, i) => [
        a.animateTo(getNodeLocation(this.frame.bindings[i].key), translateConfig),
        a.animateTo({ opacity: 1 }, fadeInConfig)
      ]),
      ...this.frameValueAnimations.flatMap((a, i) => [
        a.animateTo(getNodeLocation(this.frameValues[i]), translateConfig),
        a.animateTo({ opacity: 1 }, fadeInConfig)
      ]),
      ...this.frameArrowAnimations.flatMap(a => [
        a.animateTo({ x: 0, y: 0 }, translateConfig),
        a.animateTo({ opacity: 1 }, fadeInConfig)
      ]),
      this.frameNameAnimation.animateTo({ opacity: 1 }, fadeInConfig),
      // Fade in the arrow last
      this.frameArrowAnimation?.animateTo(
        { opacity: 1 },
        { delay: duration + (animationConfig?.delay ?? 0) }
      )
    ]);
    this.variadicArray?.ref.current?.opacity(0);
    this.variadicArray?.ref.current?.to({
      opacity: 1,
      duration: CseAnimation.defaultDuration / 2000
    });
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.frame.ref.current?.show();
    this.controlTextAnimation.destroy();
    this.borderAnimation.destroy();
    this.frameArrowAnimation?.destroy();
    this.frameNameAnimation.destroy();
    this.frameBindingKeyAnimations.forEach(a => a.destroy());
    this.frameValueAnimations.forEach(a => a.destroy());
    this.frameArrowAnimations.forEach(a => a.destroy());
  }
}
