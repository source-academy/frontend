import { NodeConfig } from 'konva/lib/Node';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';
import { Easings, Tween } from 'konva/lib/Tween';
import React from 'react';
import { Group, Rect, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { CseAnimation } from '../CseMachineAnimation';
import { ControlStashConfig } from '../CseMachineControlStash';
import { currentItemSAColor } from '../CseMachineUtils';

/** Type that extends the NodeConfig type from Konva, making the x, y, width & height values required */
type StrictNodeConfig = Omit<NodeConfig, 'x' | 'y' | 'width' | 'height'> & {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AnimationConfig = {
  durationMultiplier?: number;
  delayMultiplier?: number;
  easing?: typeof Easings.Linear;
};

export abstract class Animatable extends Visible {
  static key = -1;
  /** Plays the animation, and resolves after the animation is complete */
  abstract animate(): Promise<void>;
  /** Properly dispose of the current animation and ensures that subsequent calls to animate cannot be made */
  abstract destroy(): void;
}

abstract class AnimationComponent extends Animatable {
  private isDestroyed = false;
  private tween?: Tween;
  private resolve?: (value: void | PromiseLike<void>) => void;

  constructor(
    protected from: StrictNodeConfig,
    protected to?: NodeConfig,
    protected animationConfig?: AnimationConfig
  ) {
    super();
    this._x = from.x;
    this._y = from.y;
    this._width = from.width;
    this._height = from.height;
  }

  private async delay(duration: number) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  setDestination(to: NodeConfig, animationConfig?: AnimationConfig) {
    this.to = to;
    if (animationConfig) this.animationConfig = animationConfig;
  }

  async animate(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isDestroyed) {
        resolve();
        return;
      }
      if (!this.ref.current || !this.to) {
        const errorMsg = !this.ref.current
          ? 'Current node reference is null, unable to play animation!'
          : 'No destination value specified!';
        reject('Animation error: ' + errorMsg);
        return;
      }
      this.resolve = resolve;
      if (this.animationConfig?.delayMultiplier) {
        await this.delay(this.animationConfig.delayMultiplier * CseAnimation.defaultDuration);
      }
      if (this.isDestroyed) {
        return;
      }
      if (this.tween) {
        this.tween.pause();
        this.tween.destroy();
      }
      this.tween = new Tween({
        node: this.ref.current,
        ...this.to,
        duration: CseAnimation.defaultDuration * (this.animationConfig?.durationMultiplier ?? 1),
        easing: this.animationConfig?.easing ?? CseAnimation.defaultEasing,
        onFinish: () => {
          if (this.to) {
            if (this.to.x) this._x = this.to.x;
            if (this.to.y) this._y = this.to.y;
            if (this.to.width) this._width = this.to.width;
            if (this.to.height) this._height = this.to.height;
          }
          this.resolve = undefined;
          this.tween?.destroy();
          this.tween = undefined;
          resolve();
        }
      });
      this.tween.play();
    });
  }

  destroy() {
    this.isDestroyed = true;
    if (this.tween) {
      this.tween.finish();
    } else {
      this.resolve?.();
      this.resolve = undefined;
    }
  }
}

export class AnimatedTextComponent extends AnimationComponent {
  readonly text?: string;

  constructor(
    from: StrictNodeConfig,
    to?: NodeConfig,
    private textProps?: TextConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
    if (this.textProps?.text === undefined) {
      console.warn('AnimatedTextComponent has no text defined inside textProps.');
    }
    this.text = this.textProps?.text;
  }

  draw(): React.ReactNode {
    return (
      <Text
        ref={this.ref}
        {...(this.textProps ?? {})}
        {...this.from}
        text={this.text}
        width={this.width()}
        height={this.height()}
      />
    );
  }
}

export class AnimatedRectComponent extends AnimationComponent {
  constructor(
    from: StrictNodeConfig,
    to?: NodeConfig,
    private rectProps?: RectConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Rect
        ref={this.ref}
        {...(this.rectProps ?? {})}
        {...this.from}
        width={this.width()}
        height={this.height()}
      />
    );
  }
}

export class AnimatedTextboxComponent extends Animatable {
  private rectComponent: AnimatedRectComponent;
  private textComponent: AnimatedTextComponent;

  constructor(
    from: StrictNodeConfig,
    to?: NodeConfig,
    text?: string,
    animationConfig?: AnimationConfig
  ) {
    super();
    const rectProps = {
      stroke: currentItemSAColor(false),
      cornerRadius: Number(ControlStashConfig.ControlItemCornerRadius)
    };
    const textProps = {
      text,
      fill: ControlStashConfig.SA_WHITE.toString(),
      padding: Number(ControlStashConfig.ControlItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    this.rectComponent = new AnimatedRectComponent(from, to, rectProps, animationConfig);
    this.textComponent = new AnimatedTextComponent(from, to, textProps, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.rectComponent.draw()}
        {this.textComponent.draw()}
      </Group>
    );
  }

  setDestination(to: NodeConfig, animationConfig?: AnimationConfig) {
    this.rectComponent.setDestination(to, animationConfig);
    this.textComponent.setDestination(to, animationConfig);
  }

  async animate() {
    await Promise.all([this.rectComponent.animate(), this.textComponent.animate()]);
  }

  destroy() {
    this.rectComponent.destroy();
    this.textComponent.destroy();
  }
}
