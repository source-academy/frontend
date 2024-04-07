import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { getTextWidth, isPrimitiveData } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedTextComponent } from './base/AnimationComponents';
import { getNodeLocation, getNodePosition } from './base/AnimationUtils';
import { FrameCreationAnimation } from './FrameCreationAnimation';

export class FunctionApplicationAnimation extends Animatable {
  private callInstrAnimation: AnimatedTextbox;
  private controlItemAnimations: AnimatedTextbox[];
  private frameCreationAnimation?: FrameCreationAnimation;
  private argStashAnimations: AnimatedTextbox[] = [];
  private bindingValueAnimations: AnimatedTextComponent[] = [];
  // we still need to fade away the closure stash item when there is no frame creation animation
  private closureStashItemAnimation?: AnimatedTextbox;

  constructor(
    private callInstrItem: ControlItemComponent,
    private newControlItems: ControlItemComponent[],
    private closureStashItem: StashItemComponent,
    argStashItems: StashItemComponent[],
    private functionFrame: Frame,
    private frameCreation: boolean
  ) {
    super();
    const closureStashLocation = getNodeLocation(closureStashItem);
    this.callInstrAnimation = new AnimatedTextbox(
      callInstrItem.text,
      getNodePosition(callInstrItem)
    );
    this.controlItemAnimations = newControlItems.map(
      i => new AnimatedTextbox(i.text, { ...closureStashLocation, opacity: 0 })
    );
    if (frameCreation) {
      this.frameCreationAnimation = new FrameCreationAnimation(closureStashItem, functionFrame);
      this.argStashAnimations = argStashItems.map(
        i => new AnimatedTextbox(i.text, getNodePosition(i))
      );
      this.bindingValueAnimations = functionFrame.bindings.map((b, i) => {
        const data = b.value.data;
        return new AnimatedTextComponent({
          text: isPrimitiveData(data) ? data?.toString() ?? '' : '',
          x: argStashItems[i].x() + ControlStashConfig.StashItemTextPadding,
          y: argStashItems[i].y() + ControlStashConfig.StashItemTextPadding,
          opacity: 0
        });
      });
    } else {
      this.closureStashItemAnimation = new AnimatedTextbox(
        closureStashItem.text,
        getNodePosition(closureStashItem)
      )
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.callInstrAnimation.draw()}
        {this.controlItemAnimations.map(a => a.draw())}
        {this.frameCreationAnimation?.draw()}
        {this.argStashAnimations.map(a => a.draw())}
        {this.bindingValueAnimations.map(a => a.draw())}
        {this.closureStashItemAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.newControlItems.forEach(item => item.ref.current.hide());
    // hide the function frame before the frame creation animation plays
    if (this.frameCreation) { this.functionFrame.ref.current.hide(); }
    const minCallInstrWidth =
      getTextWidth(this.callInstrItem.text) + Number(ControlStashConfig.ControlItemTextPadding) * 2;
    // Move call instruction next to closure item in the stash
    await this.callInstrAnimation.animateTo({
      y: this.closureStashItem.y(),
      x: this.closureStashItem.x() - minCallInstrWidth,
      width: minCallInstrWidth
    });
    const config = { duration: 1.5, delay: 0.8 };
    const valuesConfig = { duration: 2, delay: 0.8 };
    await Promise.all([
      // merge call instruction into the closure
      this.callInstrAnimation.animateTo({ x: this.closureStashItem.x(), opacity: 0 }),
      ...this.controlItemAnimations.map((a, i) =>
        a.animateTo(
          { ...getNodePosition(this.newControlItems[i]), opacity: 1 },
          { delay: config.delay }
        )
      ),
      // run frame creation animation
      this.frameCreationAnimation?.animate(config),
      // if there is no frame creation, instead animate the fading of the closure stash item
      this.closureStashItemAnimation?.animateTo({
        opacity: 0
      }),
      // move arguments from stash to the frame
      ...this.argStashAnimations.flatMap((a, i) => {
        const valueAnimation = this.bindingValueAnimations[i];
        const valuePosition = getNodePosition(this.functionFrame!.bindings[i].value);
        return [
          a.animateTo(
            {
              x: valuePosition.x - ControlStashConfig.StashItemTextPadding,
              y: valuePosition.y - ControlStashConfig.StashItemTextPadding
            },
            config
          ),
          a.animateRectTo(
            { opacity: 0 },
            { duration: valuesConfig.duration / 2, delay: valuesConfig.delay }
          ),
          a.animateTextTo(
            { opacity: 0 },
            { duration: valuesConfig.duration - 0.5, delay: valuesConfig.delay + 0.5 }
          ),
          valueAnimation.animateTo(valuePosition, config),
          valueAnimation.animateTo(
            { opacity: 1 },
            { duration: valuesConfig.duration - 0.5, delay: valuesConfig.delay + 0.5 }
          )
        ];
      })
    ]);
    this.destroy();
  }

  destroy() {
    this.newControlItems.forEach(item => item.ref.current?.show());
    this.functionFrame?.ref.current?.show();
    this.ref.current?.hide();
    this.callInstrAnimation.destroy();
    this.controlItemAnimations.forEach(a => a.destroy());
    this.frameCreationAnimation?.destroy();
    this.argStashAnimations.forEach(a => a.destroy());
    this.bindingValueAnimations.forEach(a => a.destroy());
  }
}
