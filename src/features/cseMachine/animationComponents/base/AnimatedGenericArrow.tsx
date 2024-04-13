import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { PathConfig } from 'konva/lib/shapes/Path';
import { Group } from 'react-konva';
import { SharedProperties } from 'src/commons/utils/TypeHelper';

import { GenericArrow } from '../../components/arrows/GenericArrow';
import { Visible } from '../../components/Visible';
import { defaultStrokeColor, fadedStrokeColor } from '../../CseMachineUtils';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { AnimatedArrowComponent, AnimatedPathComponent } from './AnimationComponents';

type PathArrowSharedConfig = Omit<SharedProperties<PathConfig, ArrowConfig>, 'width' | 'height'>;

export class AnimatedGenericArrow<
  Source extends Visible,
  Target extends Visible
> extends AnimatableTo<PathArrowSharedConfig> {
  private pathComponent: AnimatedPathComponent;
  private arrowComponent: AnimatedArrowComponent;

  private onPropsChange = (props: PathConfig) => {
    if (props.x) this._x = this.arrow.x() + props.x;
    if (props.y) this._y = this.arrow.y() + props.y;
  };

  constructor(
    private arrow: GenericArrow<Source, Target>,
    props?: PathArrowSharedConfig
  ) {
    super();
    this._x = arrow.x();
    this._y = arrow.y();
    this._width = arrow.width();
    this._height = arrow.height();
    this.pathComponent = new AnimatedPathComponent({
      stroke: arrow.faded ? fadedStrokeColor() : defaultStrokeColor(),
      data: arrow.path(),
      ...props
    });
    this.pathComponent.addListener(this.onPropsChange);
    this.arrowComponent = new AnimatedArrowComponent({
      fill: arrow.faded ? fadedStrokeColor() : defaultStrokeColor(),
      points: arrow.points.slice(arrow.points.length - 4),
      ...props
    });
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.pathComponent.draw()}
        {this.arrowComponent.draw()}
      </Group>
    );
  }

  animatePathTo(to: Partial<PathConfig>, animationConfig?: AnimationConfig) {
    return this.pathComponent.animateTo(to, animationConfig);
  }

  animateArrowTo(to: Partial<ArrowConfig>, animationConfig?: AnimationConfig) {
    return this.arrowComponent.animateTo(to, animationConfig);
  }

  async animateTo(to: Partial<PathArrowSharedConfig>, animationConfig?: AnimationConfig) {
    await Promise.all([
      this.animatePathTo(to, animationConfig),
      this.animateArrowTo(to, animationConfig)
    ]);
  }

  destroy() {
    this.pathComponent.removeListener(this.onPropsChange);
    this.pathComponent.destroy();
    this.arrowComponent.destroy();
  }
}
