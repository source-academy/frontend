import { NodeConfig } from 'konva/lib/Node';
import { Easings } from 'konva/lib/Tween';

import { Visible } from '../../components/Visible';

export type AnimationConfig = {
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

export abstract class AnimatableTo<KonvaConfig extends NodeConfig> extends Visible {
  /** Animates the node to the specified values, and resolves after the animation is complete */
  abstract animateTo(to: Partial<KonvaConfig>, animationConfig?: AnimationConfig): Promise<void>;
  /** Properly dispose of the current animation and ensures that subsequent calls to animate cannot be made */
  abstract destroy(): void;
}
