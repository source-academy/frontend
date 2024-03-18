import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodeLocation, getNodePosition } from './base/AnimationUtils';
import { BlockAnimation } from './BlockAnimation';

export class BranchAnimation extends Animatable {
  private branchItemAnimation: AnimatedTextbox;
  private booleanItemAnimation: AnimatedTextbox;
  private blockAnimation: BlockAnimation;

  constructor(
    private branchItem: ControlItemComponent,
    booleanItem: StashItemComponent,
    private resultItems: ControlItemComponent[]
  ) {
    super();
    this.branchItemAnimation = new AnimatedTextbox(branchItem.text, getNodePosition(branchItem));
    this.booleanItemAnimation = new AnimatedTextbox(booleanItem.text, getNodePosition(booleanItem));
    this.blockAnimation = new BlockAnimation(branchItem, resultItems);
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.branchItemAnimation.draw()}
        {this.booleanItemAnimation.draw()}
        {this.blockAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItems.forEach(i => i.ref.current?.hide());
    // Move boolean next to branch instruction
    await this.booleanItemAnimation.animateTo({
      x: this.branchItem.x() + this.branchItem.width(),
      y: this.branchItem.y()
    });
    // Merge boolean and branch instruction together
    await Promise.all([
      this.branchItemAnimation.animateTo({ opacity: 0 }),
      this.booleanItemAnimation.animateTo({ ...getNodeLocation(this.branchItem), opacity: 0 }),
      // Play the block animation for the results of the branch instruction
      this.blockAnimation.animate({ delay: 0.5 })
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.branchItemAnimation.destroy();
    this.booleanItemAnimation.destroy();
    this.blockAnimation.destroy();
  }
}
