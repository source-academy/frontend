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

/**
 * Animation for the creation of a new frame. "Throws" out the frame from the origin, either
 * a ControlItemComponent when evaluating a block or a StashItemComponent when a function is
 * called.
 *
 * Used when a block containing bindings is evaluated, or as part of a function application
 * animation when a non-nullary function is called.
 */
export class FrameCreationAnimation extends Animatable {
  private controlTextAnimation: AnimatedTextComponent;
  private borderAnimation: AnimatedRectComponent;
  private frameArrowAnimation?: AnimatedGenericArrow<Frame, Frame>;
  private frameNameAnimation: AnimatedTextComponent;

  // Bindings
  private frameKeyAnimations: AnimatedTextComponent[];
  private frameValues: PrimitiveValue[];
  private frameValueAnimations: AnimatedTextComponent[];
  private frameArrows: GenericArrow<Text, Value>[];
  private frameArrowAnimations: AnimatedGenericArrow<Text, Value>[];

  // The array value that is in the frame created from a variadic closure.
  // This is special since it is the only object that is created together with the frame.
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
    this.frameKeyAnimations = frame.bindings.map(binding => {
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
        {this.frameKeyAnimations.map(a => a.draw())}
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
    // Fade in the arrow last. Declared here first so it runs alongside the rest of the animations,
    // but needed to be awaited later on in this function
    const frameArrowAnimate = this.frameArrowAnimation?.animateTo(
      { opacity: 1 },
      { delay: duration + (animationConfig?.delay ?? 0) }
    );
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
          cornerRadius: Config.FrameCornerRadius
        },
        translateConfig
      ),
      this.frameNameAnimation.animateTo(getNodePosition(this.frame.name), translateConfig),
      // Also fade frame bindings in during translation
      ...this.frameKeyAnimations.flatMap((a, i) => [
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
      this.frameNameAnimation.animateTo({ opacity: 1 }, fadeInConfig)
    ]);
    // if variadic array exists, make it fade in together with the frame arrow
    this.variadicArray?.ref.current?.opacity(0);
    this.frame.arrow?.ref.current?.hide();
    this.frame.ref.current?.show();
    this.variadicArray?.ref.current?.to({
      opacity: 1,
      duration: CseAnimation.defaultDuration / 1000
    });
    // Wait for the frame arrow animation to finish before returning
    await frameArrowAnimate;
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.frame.ref.current?.show();
    this.frame.arrow?.ref.current?.show();
    this.controlTextAnimation.destroy();
    this.borderAnimation.destroy();
    this.frameArrowAnimation?.destroy();
    this.frameNameAnimation.destroy();
    this.frameKeyAnimations.forEach(a => a.destroy());
    this.frameValueAnimations.forEach(a => a.destroy());
    this.frameArrowAnimations.forEach(a => a.destroy());
  }
}
