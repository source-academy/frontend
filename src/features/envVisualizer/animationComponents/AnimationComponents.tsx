import { NodeConfig } from 'konva/lib/Node';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';
import { Easings, Tween } from 'konva/lib/Tween';
import React from 'react';
import { Rect, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { CSEAnimation } from '../EnvVisualizerAnimation';

/** Type that extends the NodeConfig type from Konva, making the x, y, width & height values required */
type StrictNodeConfig = Omit<NodeConfig, 'x' | 'y' | 'width' | 'height'> & {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AnimationConfig = {
  durationMultiplier?: number;
  delay?: number;
  easing?: typeof Easings.Linear;
};

export abstract class Animatable extends Visible {
  static key = 0;
  /** Plays the animation, and resolves after the animation is complete */
  abstract animate(): Promise<void>;
  /** Cleans up the animation if it is still running, and properly dispose the component*/
  abstract destroy(): void;
}

abstract class AnimationComponent extends Animatable {
  protected from: StrictNodeConfig;
  private isDestroyed = false;
  private tween?: Tween;

  constructor(
    from: StrictNodeConfig,
    private to: NodeConfig,
    private animationConfig?: AnimationConfig
  ) {
    super();
    this.from = from;
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

  async animate(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.ref.current) {
        reject('Error: Current node reference is null, unable to play animation!');
      }
      if (this.animationConfig?.delay) await this.delay(this.animationConfig?.delay);
      if (this.isDestroyed) {
        resolve();
        return;
      }
      this.tween = new Tween({
        node: this.ref.current,
        ...this.to,
        duration: CSEAnimation.defaultDuration * (this.animationConfig?.durationMultiplier ?? 1),
        easing: this.animationConfig?.easing ?? Easings.StrongEaseInOut,
        onFinish: () => resolve()
      });
      this.tween.play();
    });
  }

  destroy() {
    this.isDestroyed = true;
    this.tween?.finish();
  }
}

export class AnimatedTextComponent extends AnimationComponent {
  readonly text?: string;

  constructor(
    from: StrictNodeConfig,
    to: NodeConfig,
    private textProps: TextConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
    if (this.textProps.text === undefined) {
      console.warn('AnimatedTextComponent has no text defined inside textProps.');
    }
    this.text = this.textProps.text;
  }

  draw(): React.ReactNode {
    return (
      <Text
        ref={this.ref}
        {...this.textProps}
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
    to: NodeConfig,
    private rectProps: RectConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Rect
        ref={this.ref}
        {...this.rectProps}
        {...this.from}
        width={this.width()}
        height={this.height()}
      />
    );
  }
}
