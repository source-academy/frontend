import { Easings } from 'konva/lib/Tween';
import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { defaultActiveColor, defaultDangerColor, defaultStrokeColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

/** Animation for the `pop` instruction, which removes the top item in the stash */
export class PopAnimation extends Animatable {
  private popItemAnimation: AnimatedTextbox;
  private stashItemAnimation: AnimatedTextbox;
  private undefinedStashItemAnimation?: AnimatedTextbox;

  constructor(
    popItem: ControlItemComponent,
    private stashItem: StashItemComponent,
    private undefinedStashItem?: StashItemComponent
  ) {
    super();
    const stashItemPosition = getNodePosition(stashItem);
    this.popItemAnimation = new AnimatedTextbox(popItem.text, getNodePosition(popItem), {
      rectProps: { stroke: defaultActiveColor() }
    });
    this.stashItemAnimation = new AnimatedTextbox(
      stashItem.text,
      {
        ...stashItemPosition,
        x: stashItemPosition.x + stashItemPosition.width / 2,
        offsetX: stashItemPosition.width / 2,
        y: stashItemPosition.y + stashItemPosition.height / 2,
        offsetY: stashItemPosition.height / 2
      },
      { rectProps: { stroke: defaultDangerColor() } }
    );
    if (undefinedStashItem) {
      this.undefinedStashItemAnimation = new AnimatedTextbox(undefinedStashItem.text, {
        ...getNodePosition(undefinedStashItem),
        opacity: 0
      });
    }
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.popItemAnimation.draw()}
        {this.stashItemAnimation.draw()}
        {this.undefinedStashItemAnimation?.draw()}
      </Group>
    );
  }

  async animate() {
    this.undefinedStashItem?.ref.current?.hide();
    await Promise.all([
      this.popItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }, { duration: 0.8 }),
      this.popItemAnimation.animateTo({ ...getNodePosition(this.stashItem), opacity: 0 }),
      this.stashItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }, { delay: 0.3 }),
      this.stashItemAnimation.animateTo({ scaleX: 0.6, scaleY: 0.6 }, { delay: 0.3 })
    ]);
    await Promise.all([
      this.stashItemAnimation.animateTo(
        { scaleX: 1.1, scaleY: 1.1, opacity: 0 },
        { duration: 0.5, easing: Easings.StrongEaseOut }
      ),
      this.undefinedStashItemAnimation?.animateTo({ opacity: 1 }, { delay: 0.3 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.undefinedStashItem?.ref?.current?.show();
    this.popItemAnimation.destroy();
    this.stashItemAnimation.destroy();
  }
}
