import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { AnimatedTextComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

export class ArrayLiteralAnimation extends Animatable {
  private arrayControlItemAnimation: AnimatedTextbox; // the array literal control item
  private leftBracketAnimation: AnimatedTextComponent;
  private rightBracketAnimation: AnimatedTextComponent;
  private stashItemAnimations: AnimatedTextbox[];
  private resultArrayAnimation: AnimatedTextbox;

  constructor(
    arrayControlItem: ControlItemComponent,
    stashItems: StashItemComponent[],
    private resultItem: StashItemComponent
  ) {
    super();
    this.arrayControlItemAnimation = new AnimatedTextbox(arrayControlItem.text, getNodePosition(arrayControlItem));
    this.leftBracketAnimation = new AnimatedTextComponent({
      x: arrayControlItem.x() - 10,
      y: arrayControlItem.y() + arrayControlItem.height() / 3.5,
      text: "[",
      opacity: 0
    });
    this.rightBracketAnimation = new AnimatedTextComponent({
      x: arrayControlItem.x() + arrayControlItem.width() + 10,
      y: arrayControlItem.y() + arrayControlItem.height() / 3.5,
      text: "]",
      opacity: 0
    });
    this.stashItemAnimations = stashItems.map((item) => {
      return new AnimatedTextbox(item.text, {
        ...getNodePosition(item)
      });
    });
    this.resultArrayAnimation = new AnimatedTextbox(resultItem.text, {
      ...getNodePosition(resultItem),
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.arrayControlItemAnimation.draw()}
        {this.leftBracketAnimation.draw()}
        {this.rightBracketAnimation.draw()}
        {this.stashItemAnimations.map(a => a.draw())}
        {this.resultArrayAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current?.hide();
    // make the brackets appear and the control item disappear
    await Promise.all([
      this.arrayControlItemAnimation.animateTo({ opacity: 0 }),
      this.leftBracketAnimation.animateTo({
        opacity: 1
      }),
      this.rightBracketAnimation.animateTo({
        opacity: 1
      })
    ]);
    // move the brackets to enclose the items
    const firstItem = this.stashItemAnimations.at(0)!
    const lastItem = this.stashItemAnimations.at(-1)!
    await Promise.all([
      this.leftBracketAnimation.animateTo({
        x: firstItem.x() - 10,
        y: firstItem.y() + firstItem.height() / 3.5
      }),
      this.rightBracketAnimation.animateTo({
        x: lastItem.x() + lastItem.width(),
        y: lastItem.y() + lastItem.height() / 3.5
      })
    ]);
    // squash the items with the brackets and fade into the result array
    await Promise.all([
      this.leftBracketAnimation.animateTo({
        x: this.resultItem.x(),
        opacity: 0
      }),
      this.rightBracketAnimation.animateTo({
        x: this.resultItem.x() + this.resultItem.width(),
        opacity: 0
      }),
      this.stashItemAnimations.map(a => a.animateTo({
        ...getNodePosition(this.resultItem),
        opacity: 0
      })),
      this.resultArrayAnimation.animateTo({
        opacity: 1
      })
    ])
    this.destroy();
  }

  destroy() {
    this.resultItem.ref.current?.show();
    this.arrayControlItemAnimation.destroy();
    this.leftBracketAnimation.destroy();
    this.rightBracketAnimation.destroy();
    this.stashItemAnimations.map(a => a.destroy());
    this.resultArrayAnimation.destroy();
  }
}
