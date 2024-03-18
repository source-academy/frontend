import { NodeConfig } from 'konva/lib/Node';

import { Visible } from '../../components/Visible';

export type AnimationConfig = {
  /** Duration of the animation as a factor of `CSEAnimation.defaultDuration`.
   * For example, if the default duration is 300ms and the duration value is set to `0.5`,
   * the animation would be 150ms long. If unspecified, the duration value will default to `1`.
   */
  duration?: number;

  /** Delay of the animation as a factor of `CSEAnimation.defaultDuration`.
   * For example, if the default duration is 300ms and the delay value is set to `0.5`,
   * the animation would be delayed by 150ms before it starts. If unspecified,
   * the delay value will default to `0`.
   */
  delay?: number;

  /** Easing of the animation. The easing function can be chosen from `Konva.Easings`,
   * or a custom function can also be provided. If unspecified, the defult easing function
   * will be `CSEAnimation.defaultEasing`.
   */
  easing?: (time: number, startValue: number, valueRange: number, duration: number) => number;
};

/** Class that represents a general animatable component, with the key method being `animate` */
export abstract class Animatable extends Visible {
  /** The key value to be used for all `KonvaNodeComponent` to prevent them from reusing
   * previously destroyed konva components. This value is decremented after it is used, to prevent
   * conflicts with the incrementing `Layout.key` value used inside the general layout of
   * other none-animation component. */
  static key = -1;

  /** Starts the animation. `animate` should not be called if the animation is still running.
   * @return a void promise that resolves when the animation is complete */
  abstract animate(animationConfig?: AnimationConfig): Promise<void>;

  /** Properly dispose of the current animation and ensures that subsequent calls to animate cannot be made */
  abstract destroy(): void;
}

/** Class that represents an animatable component, which allows for animations towards new values
 * defined inside the key method `animateTo`
 */
export abstract class AnimatableTo<KonvaConfig extends NodeConfig> extends Visible {
  protected listeners: ((props: Partial<KonvaConfig>) => void)[] = [];

  /** Adds a listener that is called when the animation is running */
  addListener(listener: (props: Partial<KonvaConfig>) => void) {
    this.listeners.push(listener);
  }

  /** Removes the specified listener so it is no longer called when the animation is running */
  removeListener(listener: (props: Partial<KonvaConfig>) => void) {
    const i = this.listeners.indexOf(listener);
    if (i > -1) this.listeners.splice(i, 1);
  }

  /** Animates the node to the specified values, and update any listeners attached to the animation
   * component in every frame of the animation. If multiple calls are made to `animateTo` in the same
   * frame, all animations will correctly run and start at the same time. If there are conflicts in
   * the property names in different `animateTo` calls, the latest call will be prioritised for
   * that particular property.
   * @param to the target props
   * @param animationConfig an optional animation config to customise duration, delay or easing
   * @return a void promise that resolves when the animation is complete
   */
  abstract animateTo(to: Partial<KonvaConfig>, animationConfig?: AnimationConfig): Promise<void>;

  /** Properly dispose of the current animation and ensures that subsequent calls to animate cannot be made */
  abstract destroy(): void;
}
