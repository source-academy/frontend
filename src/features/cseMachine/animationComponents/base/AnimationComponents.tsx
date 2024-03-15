import Konva from 'konva';
import { Easings } from 'konva/lib/Tween';
import React from 'react';
import { Arrow, KonvaNodeComponent, Path, Rect, Text } from 'react-konva';

import { CseAnimation } from '../../CseMachineAnimation';
import { CompactConfig } from '../../CseMachineCompactConfig';
import { ControlStashConfig } from '../../CseMachineControlStash';
import { currentItemSAColor, defaultSAColor } from '../../CseMachineUtils';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';

interface AnimationData<KonvaConfig extends Konva.NodeConfig> {
  startTime: number;
  endTime: number;
  from: Partial<KonvaConfig>;
  current: Partial<KonvaConfig>; // Note that this is mutable for performance reasons
  to: Partial<KonvaConfig>;
  easing: typeof Easings.Linear;
  resolve: (value: void | PromiseLike<void>) => void;
  reject: (reason?: any) => void;
}

abstract class BaseAnimationComponent<
  KonvaConfig extends Konva.NodeConfig
> extends AnimatableTo<KonvaConfig> {
  private isDestroyed = false;
  private animationData: AnimationData<KonvaConfig>[] = [];
  private animation: Konva.Animation;

  constructor(protected props: KonvaConfig) {
    super();
    if (!CseAnimation.getLayer()) {
      // If this occurs, it would most likely mean that this animation component is created
      // before the animation layer is even drawn, as the layer ref current value would be null.
      console.error('Missing animation layer! Unable to create animation component!');
    }
    this.animation = new Konva.Animation(frame => {
      if (!frame || this.animationData.length === 0) return false;
      if (!this.ref.current) {
        this.animationData.forEach(data =>
          data.reject(
            'Animation error: Current node reference is null, unable to continue animation!'
          )
        );
        this.animation.stop();
        return;
      }

      let animationComplete = true;
      const attrs: Partial<KonvaConfig> = {};
      const resolveList: ((value: void | PromiseLike<void>) => void)[] = [];

      this.animationData.forEach((data, i) => {
        if (frame.time <= data.startTime) {
          animationComplete = false;
          return;
        }
        // Calculate animation progress from 0 to 1
        const scale = Math.min((frame.time - data.startTime) / (data.endTime - data.startTime), 1);
        // Interpolate each attribute between the starting and ending values
        for (const attr in data.current) {
          if (typeof data.to[attr] === 'number') {
            const start = data.from[attr] as number;
            const end = data.to[attr] as number;
            const value = data.easing(scale, start, end - start, 1) as number;
            (data.current[attr] as number) = value;
            if (attr === 'x') this._x = value;
            if (attr === 'y') this._y = value;
            if (attr === 'width') this._width = value;
            if (attr === 'height') this._height = value;
          } else {
            // TODO: could handle the animation of path strings by interpolating between different coordinates
            // For now, we just simply set the value to the target value immediately
            data.current[attr] = data.to[attr];
          }
        }
        // Add the new attributes and values into the main attrs object
        Object.assign(attrs, data.current);
        // Resolve the animation's promise later if the animation is done, and also
        // remove the animation data from the list
        if (scale === 1) {
          resolveList.push(data.resolve);
          this.animationData.splice(i, 1);
        } else {
          animationComplete = false;
        }
      });
      // Set all the attributes in one go to improve performance
      this.ref.current.setAttrs(attrs);
      if (animationComplete) this.animation.stop();
      resolveList.forEach(r => r());
      return;
    }, CseAnimation.getLayer());
    if (props.x) this._x = props.x;
    if (props.y) this._y = props.y;
    if (props.width) this._width = props.width;
    if (props.height) this._height = props.height;
  }

  animateTo(to: Partial<KonvaConfig>, animationConfig?: AnimationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        resolve();
        return;
      }
      if (!this.ref.current) {
        reject(
          'Animation error: Current node reference is null, unable to start animation! ' +
            'Check that you have actually drawn the animation component first.'
        );
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
        this.animation.frame.time +
        (animationConfig?.delayMultiplier ?? 0) * CseAnimation.defaultDuration;
      const endTime =
        startTime + (animationConfig?.durationMultiplier ?? 1) * CseAnimation.defaultDuration;
      const easing = animationConfig?.easing ?? CseAnimation.defaultEasing;
      // Add animation data
      const data = { startTime, endTime, from, current: { ...from }, to, easing, resolve, reject };
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
  }
}

export class AnimationComponent<
  KonvaNode extends Konva.Node,
  KonvaConfig extends Konva.NodeConfig
> extends BaseAnimationComponent<KonvaConfig> {
  constructor(
    /** The `KonvaNodeComponent` that we want to build. Examples: `Text`, `Rect`, `Path`, etc.
     *  Note that these components are imported from the 'react-konva' library, not the
     *  standard 'konva' library.
     */
    // Note that the React nodes from `react-konva` (such as `Text`, `Rect`, etc.) are not
    // actually types/classes, but are disguised to look like them. They are just variable
    // names, and during runtime, these variables actually only contain a string of the same
    // name. This is why we can pass in `Text` or `Rect` or other React Konva Nodes directly
    // as part of a parameter, as they are not actually types, but variables.
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
  constructor(props: Konva.TextConfig) {
    const defaultProps = {
      fill: ControlStashConfig.SA_WHITE.toString(),
      padding: Number(ControlStashConfig.ControlItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    super(Text, { ...defaultProps, ...props });
    if (this.props?.text === undefined) {
      console.warn('AnimatedTextComponent has no text value!');
    }
  }
}

export class AnimatedRectComponent extends AnimationComponent<Konva.Rect, Konva.RectConfig> {
  constructor(props: Konva.RectConfig) {
    const defaultProps = {
      stroke: currentItemSAColor(false),
      cornerRadius: Number(ControlStashConfig.ControlItemCornerRadius)
    };
    super(Rect, { ...defaultProps, ...props });
  }
}

export class AnimatedPathComponent extends AnimationComponent<Konva.Path, Konva.PathConfig> {
  constructor(props: Konva.PathConfig) {
    const defaultProps = {
      stroke: defaultSAColor(),
      strokeWidth: Number(CompactConfig.ArrowStrokeWidth),
      hitStrokeWidth: Number(CompactConfig.ArrowHitStrokeWidth)
    };
    super(Path, { ...defaultProps, ...props });
    if (this.props?.data === undefined) {
      console.warn('AnimatedPathComponent has no path data!');
    }
  }
}

export class AnimatedArrowComponent extends AnimationComponent<Konva.Arrow, Konva.ArrowConfig> {
  constructor(props: Konva.ArrowConfig) {
    const defaultProps = {
      fill: defaultSAColor(),
      strokeEnabled: false,
      pointerWidth: Number(CompactConfig.ArrowHeadSize)
    };
    super(Arrow, { ...defaultProps, ...props });
    if (this.props?.points.length === 0) {
      console.warn('AnimatedArrowComponent has no points defined!');
    }
  }
}
