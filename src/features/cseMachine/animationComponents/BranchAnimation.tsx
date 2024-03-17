import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeLocation, getNodePosition } from './base/AnimationUtils';

export class BranchAnimation extends Animatable {
  private branchItemAnimation: AnimatedTextbox;
  private booleanItemAnimation: AnimatedTextbox;
  private resultItemAnimation: AnimatedTextbox;

  constructor(
    private branchItem: ControlItemComponent,
    booleanItem: StashItemComponent,
    private resultItem: ControlItemComponent
  ) {
    super();
    this.branchItemAnimation = new AnimatedTextbox(branchItem.text, getNodePosition(branchItem));
    this.booleanItemAnimation = new AnimatedTextbox(booleanItem.text, getNodePosition(booleanItem));
    this.resultItemAnimation = new AnimatedTextbox(resultItem.text, {
      ...getNodePosition(resultItem),
      opacity: 0
    });
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.branchItemAnimation.draw()}
        {this.booleanItemAnimation.draw()}
        {this.resultItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItem.ref.current?.hide();
    await this.booleanItemAnimation.animateTo({
        x: this.branchItem.x() + this.branchItem.width(),
        y: this.branchItem.y()
    });
    await Promise.all([
      this.branchItemAnimation.animateTo({ opacity: 0 }),
      this.booleanItemAnimation.animateTo({
        ...getNodeLocation(this.branchItem),
        opacity: 0
      }),
      this.resultItemAnimation.animateTo({ opacity: 1})
    ])
    this.destroy();
  }

  destroy() {
    this.resultItem.ref.current?.show();
    this.branchItemAnimation.destroy();
    this.booleanItemAnimation.destroy();
    this.resultItemAnimation.destroy();
  }
}
