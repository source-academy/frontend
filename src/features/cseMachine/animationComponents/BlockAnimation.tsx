import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Animatable, AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class BlockAnimation extends Animatable {
  initialItemAnimation: AnimatedTextboxComponent;
  targetItemAnimations: AnimatedTextboxComponent[];

  constructor(
    private initialItem: ControlItemComponent,
    private targetItems: ControlItemComponent[]
  ) {
    super();
    const initialPosition = getNodePositionFromItem(this.initialItem);
    targetItems.sort((a, b) => a.y() - b.y());
    let totalHeight = 0;
    this.targetItemAnimations = targetItems.map((item, index) => {
      const destination = getNodePositionFromItem(item);
      totalHeight += destination.height;
      return new AnimatedTextboxComponent(
        {
          ...initialPosition,
          y: initialPosition.y + (index / targetItems.length) * initialPosition.height,
          height: destination.height,
          opacity: 0
        },
        { ...destination, opacity: 1 },
        item.text
      );
    });
    this.initialItemAnimation = new AnimatedTextboxComponent(
      initialPosition,
      { height: totalHeight, opacity: 0 },
      initialItem.text
    );
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.initialItemAnimation.draw()}
        {this.targetItemAnimations.map(c => c.draw())}
      </Group>
    );
  }

  async animate() {
    this.targetItems.forEach(c => c.ref.current.hide());
    await Promise.all([
      this.initialItemAnimation.animate(),
      ...this.targetItemAnimations.map(a => a.animate())
    ]);
    this.targetItems.forEach(c => c.ref.current?.show());
  }

  destroy() {
    this.initialItemAnimation.destroy();
    this.targetItemAnimations.forEach(a => a.destroy());
  }
}
