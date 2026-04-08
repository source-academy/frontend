import { CircleConfig } from 'konva/lib/shapes/Circle';
import { Group } from 'react-konva';

import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { Config } from '../../CseMachineConfig';
import { defaultBackgroundColor, defaultStrokeColor } from '../../CseMachineUtils';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { AnimatedCircleComponent } from './AnimationComponents';

export class AnimatedFnObject extends AnimatableTo<CircleConfig> {
  private leftCircle: AnimatedCircleComponent;
  private leftInner: AnimatedCircleComponent;
  private rightCircle: AnimatedCircleComponent;
  private rightInner: AnimatedCircleComponent;
  private centerX: number;

  // Update the current component's dimensions based on the inner rect component's dimensions
  private onPropsChange = (props: CircleConfig) => {
    if (props.x !== undefined) this._x = props.x;
    if (props.y !== undefined) this._y = props.y;
    if (props.width !== undefined) this._width = props.width;
    if (props.height !== undefined) this._height = props.height;
  };

  constructor(fn: FnValue | GlobalFnValue, props?: CircleConfig, isCover?: boolean) {
    super();
    this._x = fn.x();
    this._y = fn.y();
    this._width = fn.width();
    this._height = fn.height();
    this.centerX = fn.centerX;

    const { width, height, radius, x, y, ...safeProps } = props || {};

    this.leftCircle = isCover
      ? new AnimatedCircleComponent({
          x: this.centerX - Config.FnRadius,
          y: this._y,
          radius: Config.FnRadius,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          strokeWidth: 3.5,
          ...safeProps
        })
      : new AnimatedCircleComponent({
          x: this.centerX - Config.FnRadius,
          y: this._y,
          radius: Config.FnRadius,
          ...safeProps
        });
    this.leftInner = isCover
      ? new AnimatedCircleComponent({
          x: this.centerX - Config.FnRadius,
          y: this._y,
          radius: Config.FnInnerRadius,
          strokeWidth: 2,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          ...safeProps
        })
      : new AnimatedCircleComponent({
          x: this.centerX - Config.FnRadius,
          y: this._y,
          radius: Config.FnInnerRadius,
          strokeWidth: 0,
          fill: defaultStrokeColor(),
          ...safeProps
        });
    this.rightCircle = isCover
      ? new AnimatedCircleComponent({
          x: this.centerX + Config.FnRadius,
          y: this._y,
          radius: Config.FnRadius,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          strokeWidth: 3.5,
          ...safeProps
        })
      : new AnimatedCircleComponent({
          x: this.centerX + Config.FnRadius,
          y: this._y,
          radius: Config.FnRadius,
          ...safeProps
        });
    this.rightInner = isCover
      ? new AnimatedCircleComponent({
          x: this.centerX + Config.FnRadius,
          y: this._y,
          radius: Config.FnInnerRadius,
          strokeWidth: 2,
          fill: defaultBackgroundColor(),
          stroke: defaultBackgroundColor(),
          ...safeProps
        })
      : new AnimatedCircleComponent({
          x: this.centerX + Config.FnRadius,
          y: this._y,
          radius: Config.FnInnerRadius,
          strokeWidth: 0,
          fill: defaultStrokeColor(),
          ...safeProps
        });
    this.leftCircle.addListener(this.onPropsChange);
    this.leftInner.addListener(this.onPropsChange);
    this.rightCircle.addListener(this.onPropsChange);
    this.rightInner.addListener(this.onPropsChange);
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.leftCircle.draw()}
        {this.rightCircle.draw()}
        {this.leftInner.draw()}
        {this.rightInner.draw()}
      </Group>
    );
  }

  async animateTo(to: Partial<CircleConfig>, animationConfig?: AnimationConfig) {
    const { x, y, ...others } = to;
    await Promise.all([
      this.leftCircle.animateTo(
        {
          ...others,
          ...(x !== undefined && { x: x + Config.FnRadius }),
          ...(y !== undefined && { y: y })
        },
        animationConfig
      ),
      this.leftInner.animateTo(
        {
          ...others,
          ...(x !== undefined && { x: x + Config.FnRadius }),
          ...(y !== undefined && { y: y })
        },
        animationConfig
      ),
      this.rightCircle.animateTo(
        {
          ...others,
          ...(x !== undefined && { x: x + 3 * Config.FnRadius }),
          ...(y !== undefined && { y: y })
        },
        animationConfig
      ),
      this.rightInner.animateTo(
        {
          ...others,
          ...(x !== undefined && { x: x + 3 * Config.FnRadius }),
          ...(y !== undefined && { y: y })
        },
        animationConfig
      )
    ]);
  }

  destroy() {
    this.leftCircle.removeListener(this.onPropsChange);
    this.leftInner.removeListener(this.onPropsChange);
    this.rightCircle.removeListener(this.onPropsChange);
    this.rightInner.removeListener(this.onPropsChange);
    this.leftCircle.destroy();
    this.leftInner.destroy();
    this.rightCircle.destroy();
    this.rightInner.destroy();
  }
}
