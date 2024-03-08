import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { currentItemSAColor } from '../CseMachineUtils';
import {
  Animatable,
  AnimatedRectComponent,
  AnimatedTextboxComponent,
  AnimatedTextComponent
} from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class BlockAnimation extends Animatable {
  initialItemAnimation: Animatable;
  targetItemAnimations: Animatable[];

  constructor(
    private initialItem: ControlItemComponent,
    private targetItems: ControlItemComponent[]
  ) {
    super();
    const initialPosition = getNodePositionFromItem(this.initialItem);
    targetItems.sort((a, b) => a.y() - b.y());
    let totalHeight = 0;
    this.targetItemAnimations = new Array(targetItems.length + 1);
    let i = 0;
    for (i = 0; i < targetItems.length - 1; i++) {
      const destination = getNodePositionFromItem(targetItems[i]);
      totalHeight += destination.height;
      this.targetItemAnimations[i] = new AnimatedTextboxComponent(
        {
          ...initialPosition,
          y: initialPosition.y + (i / targetItems.length) * initialPosition.height,
          height: destination.height,
          opacity: 0
        },
        { ...destination, opacity: 1 },
        targetItems[i].text
      );
    }
    // We also need to animate the color of the last item rect, so we need to split it
    // into 2 different animations (text and rect) instead
    const lastPosition = getNodePositionFromItem(targetItems[i]);
    totalHeight += lastPosition.height;
    const lastPositionStart = {
      ...initialPosition,
      y: initialPosition.y + (i / targetItems.length) * initialPosition.height,
      height: lastPosition.height,
      opacity: 0
    };
    const lastPositionEnd = { ...lastPosition, opacity: 1 };
    this.targetItemAnimations.push(
      new AnimatedTextComponent(lastPositionStart, lastPositionEnd, targetItems[i].text),
      new AnimatedRectComponent(lastPositionStart, {
        ...lastPositionEnd,
        stroke: currentItemSAColor(true)
      })
    );
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
    this.ref.current?.hide();
    this.targetItems.forEach(c => c.ref.current?.show());
  }

  destroy() {
    this.initialItemAnimation.destroy();
    this.targetItemAnimations.forEach(a => a.destroy());
  }
}
