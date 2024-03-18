import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { currentItemSAColor } from '../CseMachineUtils';
import { Animatable, AnimationConfig } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class BlockAnimation extends Animatable {
  private initialItemAnimation: AnimatedTextbox;
  private targetItemAnimations: AnimatedTextbox[];

  constructor(
    private initialItem: ControlItemComponent,
    private targetItems: ControlItemComponent[]
  ) {
    super();
    this.targetItems = [...targetItems];
    this.targetItems.sort((a, b) => a.y() - b.y());
    const initialPosition = getNodePosition(this.initialItem);
    this.initialItemAnimation = new AnimatedTextbox(initialItem.text, initialPosition);
    this.targetItemAnimations = this.targetItems.map((item, i) => {
      return new AnimatedTextbox(item.text, {
        ...initialPosition,
        y: initialPosition.y + (i / this.targetItems.length) * initialPosition.height,
        height: item.height(),
        opacity: 0
      });
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.initialItemAnimation.draw()}
        {this.targetItemAnimations.map(c => c.draw())}
      </Group>
    );
  }

  async animate(animationConfig?: AnimationConfig) {
    this.targetItems.forEach(c => c.ref.current.hide());
    const totalHeight = this.targetItems.reduce((height, item) => height + item.height(), 0);
    await Promise.all([
      // Fade out the previous item while also changing its height for a more fluid animation
      this.initialItemAnimation.animateTo({ height: totalHeight, opacity: 0 }, animationConfig),
      // Fade in the new items while also moving them from the old item's position
      ...this.targetItemAnimations.map((a, i) =>
        a.animateTo({ ...getNodePosition(this.targetItems[i]), opacity: 1 }, animationConfig)
      ),
      // Also animate the last item's rect border color to the blue border
      // which the last control item always have
      this.targetItemAnimations
        .at(-1)
        ?.animateRectTo({ stroke: currentItemSAColor(true) }, animationConfig)
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.targetItems.forEach(c => c.ref.current?.show());
    this.initialItemAnimation.destroy();
    this.targetItemAnimations.forEach(a => a.destroy());
  }
}
