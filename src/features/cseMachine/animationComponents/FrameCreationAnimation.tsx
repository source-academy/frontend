import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { Config } from '../CseMachineConfig';
import { currentItemSAColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedGenericArrow } from './base/AnimatedGenericArrow';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

export class FrameCreationAnimation extends Animatable {
  private controlAnimation: AnimatedTextbox;
  private frameArrowAnimation?: AnimatedGenericArrow<Frame, Frame>;
  private frameNameAnimation: AnimatedTextComponent;
  private frameBorderAnimation: AnimatedRectComponent;
  private frameBindingsAnimation: AnimatedTextComponent[];

  constructor(
    private currFrame: Frame,
    private controlItem: ControlItemComponent
  ) {
    super();
    const moveDistance = 16;
    this.controlAnimation = new AnimatedTextbox(controlItem.text, getNodePosition(controlItem), {
      rectProps: { stroke: currentItemSAColor(true) }
    });
    if (currFrame.arrow) {
      this.frameArrowAnimation = new AnimatedGenericArrow(currFrame.arrow, { opacity: 0 });
    }
    this.frameNameAnimation = new AnimatedTextComponent({
      text: currFrame.name.partialStr,
      ...getNodePosition(currFrame.name),
      y: currFrame.name.y() - moveDistance,
      opacity: 0
    });
    this.frameBorderAnimation = new AnimatedRectComponent({
      ...getNodePosition(currFrame),
      cornerRadius: Number(Config.FrameCornerRadius),
      stroke: currentItemSAColor(true),
      y: currFrame.y() - moveDistance,
      opacity: 0
    });
    this.frameBindingsAnimation = currFrame.bindings.map(binding => {
      return new AnimatedTextComponent({
        text: binding.keyString,
        ...getNodePosition(binding.key),
        y: binding.key.y() - moveDistance,
        opacity: 0
      });
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.controlAnimation.draw()}
        {this.frameArrowAnimation?.draw()}
        {this.frameNameAnimation.draw()}
        {this.frameBorderAnimation.draw()}
        {this.frameBindingsAnimation.map(a => a.draw())}
      </Group>
    );
  }

  async animate() {
    this.currFrame.ref.current.hide();
    const framePosition = getNodePosition(this.currFrame);
    const duration =
      Math.sqrt(
        Math.pow(framePosition.x - this.controlItem.x(), 2) +
          Math.pow(framePosition.y - this.controlItem.y(), 2)
      ) /
        500 +
      0.5;
    await Promise.all([
      // Move control block towards current frame position, while also fading out
      this.controlAnimation.animateTo({ x: framePosition.x, y: framePosition.y }, { duration }),
      this.controlAnimation.animateTo({ opacity: 0 }, { duration: 0.4, delay: duration - 0.6 }),
      // Fade in all the frame elements with a slight movement downwards
      this.frameNameAnimation.animateTo(
        { ...getNodePosition(this.currFrame.name), opacity: 1 },
        { delay: duration - 0.6 }
      ),
      this.frameBorderAnimation.animateTo(
        { ...framePosition, opacity: 1 },
        { delay: duration - 0.6 }
      ),
      ...this.frameBindingsAnimation.map((a, i) =>
        a.animateTo(
          { ...getNodePosition(this.currFrame.bindings[i]), opacity: 1 },
          { delay: duration - 0.6 }
        )
      ),
      // Fade in arrow as well
      this.frameArrowAnimation?.animateTo({ opacity: 1 }, { delay: duration - 0.2 })
    ]);
    this.destroy();
  }

  destroy() {
    this.currFrame.ref.current?.show();
    this.controlAnimation.destroy();
    this.frameArrowAnimation?.destroy();
    this.frameNameAnimation.destroy();
    this.frameBorderAnimation.destroy();
    this.frameBindingsAnimation.forEach(a => a.destroy());
  }
}
