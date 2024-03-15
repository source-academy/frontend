import { NodeConfig } from 'konva/lib/Node';
import { Group } from 'react-konva';

import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { AnimatedRectComponent, AnimatedTextComponent } from './AnimationComponents';

export class AnimatedTextbox extends AnimatableTo<NodeConfig> {
  private rectComponent: AnimatedRectComponent;
  private textComponent: AnimatedTextComponent;

  constructor(text: string, props: NodeConfig) {
    super();
    if (props.x) this._x = props.x;
    if (props.y) this._y = props.y;
    if (props.width) this._width = props.width;
    if (props.height) this._height = props.height;
    this.rectComponent = new AnimatedRectComponent(props);
    this.textComponent = new AnimatedTextComponent({ ...props, text });
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.rectComponent.draw()}
        {this.textComponent.draw()}
      </Group>
    );
  }

  async animateTo(to: Partial<NodeConfig>, animationConfig?: AnimationConfig) {
    await Promise.all([
      this.rectComponent.animateTo(to, animationConfig),
      this.textComponent.animateTo(to, animationConfig)
    ]);
    this._x = this.rectComponent.x();
    this._y = this.rectComponent.y();
    this._width = this.rectComponent.width();
    this._height = this.rectComponent.height();
  }

  destroy() {
    this.rectComponent.destroy();
    this.textComponent.destroy();
  }
}
