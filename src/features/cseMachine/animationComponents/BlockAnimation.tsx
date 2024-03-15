import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { currentItemSAColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedRectComponent, AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

export class BlockAnimation extends Animatable {
  private initialItemAnimation: AnimatedTextbox;
  private targetItemAnimations: AnimatedTextbox[];
  private lastTargetTextAnimation: AnimatedTextComponent;
  private lastTargetRectAnimation: AnimatedRectComponent;

  constructor(
    private initialItem: ControlItemComponent,
    private targetItems: ControlItemComponent[]
  ) {
    super();
    if (targetItems.length === 0) {
      const msg = 'There must be at least one target item specified!';
      console.error(msg);
      throw new Error(msg);
    }
    this.targetItems = [...targetItems];
    this.targetItems.sort((a, b) => a.y() - b.y());
    const initialPosition = getNodePosition(this.initialItem);
    this.initialItemAnimation = new AnimatedTextbox(initialItem.text, initialPosition);
    this.targetItemAnimations = this.targetItems.slice(0, -1).map((item, i) => {
      return new AnimatedTextbox(item.text, {
        ...initialPosition,
        y: initialPosition.y + (i / this.targetItems.length) * initialPosition.height,
        height: item.height(),
        opacity: 0
      });
    });
    // We need to animate the color of the last item rect, so we need to split it
    // into 2 different animations (text and rect) instead
    const lastItem = this.targetItems.at(-1)!;
    const lastPositionStart = {
      ...initialPosition,
      y: initialPosition.y + (1 - 1 / this.targetItems.length) * initialPosition.height,
      height: lastItem.height(),
      opacity: 0
    };
    this.lastTargetTextAnimation = new AnimatedTextComponent({
      ...lastPositionStart,
      text: lastItem.text
    });
    this.lastTargetRectAnimation = new AnimatedRectComponent(lastPositionStart);
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.initialItemAnimation.draw()}
        {this.targetItemAnimations.map(c => c.draw())}
        {this.lastTargetTextAnimation.draw()}
        {this.lastTargetRectAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.targetItems.forEach(c => c.ref.current.hide());
    const totalHeight = this.targetItems.reduce((height, item) => height + item.height(), 0);
    const lastPosition = getNodePosition(this.targetItems.at(-1)!);
    await Promise.all([
      this.initialItemAnimation.animateTo({ height: totalHeight, opacity: 0 }),
      ...this.targetItemAnimations.map((a, i) =>
        a.animateTo({ ...getNodePosition(this.targetItems[i]), opacity: 1 })
      ),
      this.lastTargetTextAnimation.animateTo({ ...lastPosition, opacity: 1 }),
      this.lastTargetRectAnimation.animateTo({
        ...lastPosition,
        opacity: 1,
        stroke: currentItemSAColor(true)
      })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.targetItems.forEach(c => c.ref.current?.show());
    this.initialItemAnimation.destroy();
    this.targetItemAnimations.forEach(a => a.destroy());
    this.lastTargetTextAnimation.destroy();
    this.lastTargetRectAnimation.destroy();
  }
}
