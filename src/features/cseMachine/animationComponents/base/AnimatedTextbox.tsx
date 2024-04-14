import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';
import { Group } from 'react-konva';
import { SharedProperties } from 'src/commons/utils/TypeHelper';

import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { Animatable, AnimatableTo, AnimationConfig } from './Animatable';
import { AnimatedRectComponent, AnimatedTextComponent } from './AnimationComponents';

type TextRectSharedConfig = SharedProperties<TextConfig, RectConfig>;

export class AnimatedTextbox extends AnimatableTo<TextRectSharedConfig> {
  private rectComponent: AnimatedRectComponent;
  private textComponent: AnimatedTextComponent;

  // Update the current component's dimensions based on the inner rect component's dimensions
  private onPropsChange = (props: RectConfig) => {
    if (props.x) this._x = props.x;
    if (props.y) this._y = props.y;
    if (props.width) this._width = props.width;
    if (props.height) this._height = props.height;
  };

  constructor(
    text: string,
    sharedProps: TextRectSharedConfig,
    additionalProps?: { rectProps?: RectConfig; textProps?: TextConfig }
  ) {
    super();
    const rectProps = { ...sharedProps, ...additionalProps?.rectProps };
    this.onPropsChange(rectProps);
    this.rectComponent = new AnimatedRectComponent(rectProps);
    this.rectComponent.addListener(this.onPropsChange);
    const textProps = {
      padding: ControlStashConfig.ControlItemTextPadding,
      ...sharedProps,
      ...additionalProps?.textProps,
      text
    };
    this.textComponent = new AnimatedTextComponent(textProps);
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.rectComponent.draw()}
        {this.textComponent.draw()}
      </Group>
    );
  }

  animateRectTo(to: Partial<RectConfig>, animationConfig?: AnimationConfig) {
    return this.rectComponent.animateTo(to, animationConfig);
  }

  animateTextTo(to: Partial<TextConfig>, animationConfig?: AnimationConfig) {
    return this.textComponent.animateTo(to, animationConfig);
  }

  async animateTo(to: Partial<TextRectSharedConfig>, animationConfig?: AnimationConfig) {
    await Promise.all([
      this.animateRectTo(to, animationConfig),
      this.animateTextTo(to, animationConfig)
    ]);
  }

  destroy() {
    this.rectComponent.removeListener(this.onPropsChange);
    this.rectComponent.destroy();
    this.textComponent.destroy();
  }
}
