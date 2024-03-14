import { NodeConfig } from 'konva/lib/Node';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { PathConfig } from 'konva/lib/shapes/Path';
import React from 'react';
import { Arrow, Group, Path } from 'react-konva';

import { GenericArrow } from '../compactComponents/arrows/GenericArrow';
import { Visible } from '../components/Visible';
import { CompactConfig, ShapeDefaultProps } from '../CseMachineCompactConfig';
import { defaultSAColor } from '../CseMachineUtils';
import { Animatable, AnimationComponent, AnimationConfig } from './AnimationComponents';

class AnimatedPathComponent extends AnimationComponent {
  constructor(
    private pathProps: PathConfig,
    from?: NodeConfig,
    to?: NodeConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Path
        ref={this.ref}
        key={Animatable.key--}
        {...ShapeDefaultProps}
        {...this.pathProps}
        {...this.from}
        listening={false}
        preventDefault={true}
      />
    );
  }
}

class AnimatedArrowComponent extends AnimationComponent {
  constructor(
    private arrowProps: ArrowConfig,
    from?: NodeConfig,
    to?: NodeConfig,
    animationConfig?: AnimationConfig
  ) {
    super(from, to, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Arrow
        ref={this.ref}
        key={Animatable.key--}
        {...ShapeDefaultProps}
        {...this.arrowProps}
        {...this.from}
        listening={false}
        preventDefault={true}
      />
    );
  }
}

// Converts a GenericArrow to an AnimatedGenericArrow with additional params from and to
export class AnimatedGenericArrow<
  Source extends Visible,
  Target extends Visible
> extends Animatable {
  private pathComponent: AnimatedPathComponent;
  private arrowComponent: AnimatedArrowComponent;

  constructor(
    arrow: GenericArrow<Source, Target>,
    from?: NodeConfig,
    to?: NodeConfig,
    animationConfig?: AnimationConfig
  ) {
    super();
    this._x = arrow.x();
    this._y = arrow.y();
    this._width = arrow.width();
    this._height = arrow.height();
    const pathProps = {
      stroke: defaultSAColor(),
      strokeWidth: Number(CompactConfig.ArrowStrokeWidth),
      hitStrokeWidth: Number(CompactConfig.ArrowHitStrokeWidth),
      data: arrow.path()
    };
    const arrowProps = {
      points: arrow.points.slice(arrow.points.length - 4),
      fill: defaultSAColor(),
      strokeEnabled: false,
      pointerWidth: Number(CompactConfig.ArrowHeadSize)
    };
    this.pathComponent = new AnimatedPathComponent(pathProps, from, to, animationConfig);
    this.arrowComponent = new AnimatedArrowComponent(arrowProps, from, to, animationConfig);
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.pathComponent.draw()}
        {this.arrowComponent.draw()}
      </Group>
    );
  }

  async animate() {
    await Promise.all([this.pathComponent.animate(), this.arrowComponent.animate()]);
  }

  async animateTo(to: NodeConfig, animationConfig?: AnimationConfig) {
    this.pathComponent.animateTo(to, animationConfig);
    this.arrowComponent.animateTo(to, animationConfig);
  }

  destroy() {
    this.pathComponent.destroy();
    this.arrowComponent.destroy();
  }
}
