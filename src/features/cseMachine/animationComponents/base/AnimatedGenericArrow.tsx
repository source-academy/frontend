import { NodeConfig } from 'konva/lib/Node';
import { Group } from 'react-konva';

import { GenericArrow } from '../../compactComponents/arrows/GenericArrow';
import { Visible } from '../../components/Visible';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { AnimatedArrowComponent, AnimatedPathComponent } from './AnimationComponents';

export class AnimatedGenericArrow<
  Source extends Visible,
  Target extends Visible
> extends AnimatableTo<NodeConfig> {
  private pathComponent: AnimatedPathComponent;
  private arrowComponent: AnimatedArrowComponent;

  private onPropsChange = (props: NodeConfig) => {
    if (props.x) this._x = this.arrow.x() + props.x;
    if (props.y) this._y = this.arrow.y() + props.y;
  };

  constructor(
    private arrow: GenericArrow<Source, Target>,
    props: NodeConfig
  ) {
    super();
    this._x = arrow.x();
    this._y = arrow.y();
    this._width = arrow.width();
    this._height = arrow.height();
    this.pathComponent = new AnimatedPathComponent({ ...props, data: arrow.path() });
    this.pathComponent.addListener(this.onPropsChange);
    this.arrowComponent = new AnimatedArrowComponent({
      ...props,
      points: arrow.points.slice(arrow.points.length - 4)
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

  async animateTo(to: Partial<NodeConfig>, animationConfig?: AnimationConfig) {
    await Promise.all([
      this.pathComponent.animateTo(to, animationConfig),
      this.arrowComponent.animateTo(to, animationConfig)
    ]);
  }

  destroy() {
    this.pathComponent.removeListener(this.onPropsChange);
    this.pathComponent.destroy();
    this.arrowComponent.destroy();
  }
}
