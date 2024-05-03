import Konva from 'konva';
import { AnimationFn } from 'konva/lib/types';
import React from 'react';
import { Arrow, KonvaNodeComponent, Path, Rect, Text } from 'react-konva';

import { CseAnimation } from '../../CseMachineAnimation';
import { Config } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { defaultStrokeColor, defaultTextColor } from '../../CseMachineUtils';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { lerp } from './AnimationUtils';

type AnimationData<KonvaConfig extends Konva.NodeConfig> = {
  startTime: number;
  endTime: number;
  from: Readonly<Partial<KonvaConfig>>;
  current: Partial<KonvaConfig>;
  to: Readonly<Partial<KonvaConfig>>;
  easing: NonNullable<AnimationConfig['easing']>;
  resolve: (value: void | PromiseLike<void>) => void;
};

abstract class BaseAnimationComponent<
  KonvaConfig extends Konva.NodeConfig
> extends AnimatableTo<KonvaConfig> {
  private isDestroyed = false;
  private animationData: AnimationData<KonvaConfig>[] = [];
  private animation: Konva.Animation;

  private animationFn: AnimationFn = frame => {
    if (!frame || this.animationData.length === 0) return false;
    if (!this.ref.current) {
      this.animationData.forEach(data => data.resolve());
      this.animation.stop();
      return;
    }

    let animationComplete = true;
    const attrs: Partial<KonvaConfig> = {};
    const resolveList: ((value: void | PromiseLike<void>) => void)[] = [];

    let i = 0;
    while (i < this.animationData.length) {
      const data = this.animationData[i];
      if (frame.time <= data.startTime) {
        animationComplete = false;
        i++;
        continue;
      }
      // Calculate animation progress from 0 to 1
      const delta = Math.min((frame.time - data.startTime) / (data.endTime - data.startTime), 1);
      // Interpolate each attribute between the starting and ending values
      for (const attr in data.current) {
        const value = lerp(delta, attr, data.from[attr], data.to[attr], data.easing);
        data.current[attr] = value;
        if (attr === 'x') this._x = value;
        if (attr === 'y') this._y = value;
        if (attr === 'width') this._width = value;
        if (attr === 'height') this._height = value;
      }
      // Add the new attributes and values into the main attrs object
      Object.assign(attrs, data.current);
      // Resolve the animation's promise later if the animation is done, and also
      // remove the animation data from the list
      if (delta === 1) {
        resolveList.push(data.resolve);
        this.animationData.splice(i, 1);
      } else {
        animationComplete = false;
        i++;
      }
    }
    if (Object.keys(attrs).length > 0) {
      // Set all the attributes in one go to improve performance
      this.ref.current.setAttrs(attrs);
      this.listeners.forEach(f => f({ ...attrs }));
    }
    if (animationComplete) this.animation.stop();
    resolveList.forEach(r => r());
    return;
  };

  constructor(protected props: KonvaConfig) {
    super();
    if (!CseAnimation.getLayer()) {
      // If this occurs, it would most likely mean that this animation component is created
      // before the animation layer is even drawn, as the layer ref current value would be null.
      throw new Error('Missing animation layer! Unable to create animation component!');
    }
    this.animation = new Konva.Animation(this.animationFn, CseAnimation.getLayer());
    if (props.x) this._x = props.x;
    if (props.y) this._y = props.y;
    if (props.width) this._width = props.width;
    if (props.height) this._height = props.height;
  }

  animateTo(to: Partial<KonvaConfig>, animationConfig?: AnimationConfig): Promise<void> {
    return new Promise(resolve => {
      // Note: this.ref.current being undefined could also result from not calling the draw
      // function of this animation component.
      // TODO: find a better way to detect the animation component not being drawn
      if (this.isDestroyed || Object.keys(to).length === 0 || !this.ref.current) {
        resolve();
        return;
      }
      const node: Konva.Node = this.ref.current;
      // Get current node values first
      const from: Partial<KonvaConfig> = {};
      for (const attr in to) {
        from[attr] = node.getAttr(attr);
      }
      // Calculate timings based on values given in animationConfig
      const startTime =
        this.animation.frame.time + (animationConfig?.delay ?? 0) * CseAnimation.defaultDuration;
      const endTime = startTime + (animationConfig?.duration ?? 1) * CseAnimation.defaultDuration;
      const easing = animationConfig?.easing ?? CseAnimation.defaultEasing;
      // Add animation data
      const data = { startTime, endTime, from, current: { ...from }, to, easing, resolve };
      this.animationData.push(data);
      // Play animation
      if (!this.animation.isRunning()) this.animation.start();
    });
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animation.isRunning()) {
      this.animation.stop();
    }
    this.ref.current?.hide();
    this.animationData.forEach(data => data.resolve());
    this.animationData.length = 0;
    this.listeners.length = 0;
  }
}

export class AnimationComponent<
  KonvaNode extends Konva.Node,
  KonvaConfig extends Konva.NodeConfig
> extends BaseAnimationComponent<KonvaConfig> {
  constructor(
    /**
     * The `KonvaNodeComponent` that we want to build. Examples: `Text`, `Rect`, `Path`, etc.
     * Note that these components are imported from the 'react-konva' library, not the
     * standard 'konva' library.
     */
    // Note that the React nodes from `react-konva` (such as `Text`, `Rect`, etc.) are not
    // actually types or classes, but are actually variables.
    private type: KonvaNodeComponent<KonvaNode, KonvaConfig>,
    /** The props we want our konva node to have initially. It should match the correct
     *  subtype of `NodeConfig` that the konva node requires. */
    props: KonvaConfig
  ) {
    super(props);
  }

  draw(): React.ReactNode {
    const ReactKonvaNode = this.type;
    return (
      <ReactKonvaNode
        ref={this.ref}
        key={Animatable.key--}
        {...this.props}
        listening={false}
        perfectDrawEnabled={false}
      />
    );
  }
}

export class AnimatedTextComponent extends AnimationComponent<Konva.Text, Konva.TextConfig> {
  constructor(props: Konva.TextConfig & Required<Pick<Konva.TextConfig, 'text'>>) {
    const defaultProps = {
      fill: defaultTextColor(),
      fontFamily: ControlStashConfig.FontFamily,
      fontSize: ControlStashConfig.FontSize,
      fontStyle: ControlStashConfig.FontStyle,
      fontVariant: ControlStashConfig.FontVariant
    };
    super(Text, { ...defaultProps, ...props, width: undefined });
  }

  animateTo(to: Partial<Konva.TextConfig>, animationConfig?: AnimationConfig) {
    return super.animateTo({ ...to, width: undefined }, animationConfig);
  }
}

export class AnimatedRectComponent extends AnimationComponent<Konva.Rect, Konva.RectConfig> {
  constructor(props: Konva.RectConfig) {
    const defaultProps = {
      stroke: defaultStrokeColor(),
      cornerRadius: ControlStashConfig.ControlItemCornerRadius
    };
    super(Rect, { ...defaultProps, ...props });
  }
}

export class AnimatedPathComponent extends AnimationComponent<Konva.Path, Konva.PathConfig> {
  constructor(props: Konva.PathConfig & Required<Pick<Konva.PathConfig, 'data'>>) {
    const defaultProps = {
      stroke: defaultStrokeColor(),
      strokeWidth: Config.ArrowStrokeWidth
    };
    super(Path, { ...defaultProps, ...props });
  }
}

export class AnimatedArrowComponent extends AnimationComponent<Konva.Arrow, Konva.ArrowConfig> {
  constructor(props: Konva.ArrowConfig) {
    const defaultProps = {
      fill: defaultStrokeColor(),
      strokeEnabled: false,
      pointerWidth: Config.ArrowHeadSize
    };
    super(Arrow, { ...defaultProps, ...props });
  }
}
