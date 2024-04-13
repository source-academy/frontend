import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { defaultDangerColor, defaultStrokeColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';
import { ControlExpansionAnimation } from './ControlExpansionAnimation';

/**
 * Animation for the `branch` instruction.
 */
export class BranchAnimation extends Animatable {
  private booleanItemAnimation: AnimatedTextbox;
  private controlExpandAnimation: ControlExpansionAnimation;

  constructor(
    private branchItem: ControlItemComponent,
    booleanItem: StashItemComponent,
    private resultItems: ControlItemComponent[]
  ) {
    super();
    this.booleanItemAnimation = new AnimatedTextbox(
      booleanItem.text,
      getNodePosition(booleanItem),
      { rectProps: { stroke: defaultDangerColor() } }
    );
    // Note that branch item is drawn in here as well
    this.controlExpandAnimation = new ControlExpansionAnimation(branchItem, resultItems);
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.controlExpandAnimation.draw()}
        {this.booleanItemAnimation.draw()}
      </Group>
    );
  }

  async animate() {
    this.resultItems.forEach(i => i.ref.current?.hide());
    // Move boolean next to branch instruction
    await Promise.all([
      this.booleanItemAnimation.animateRectTo({ stroke: defaultStrokeColor() }),
      this.booleanItemAnimation.animateTo({
        x: this.branchItem.x() + this.branchItem.width(),
        y: this.branchItem.y()
      })
    ]);
    // Merge boolean and branch instruction together
    await Promise.all([
      this.booleanItemAnimation.animateTo({ x: this.branchItem.x() }),
      this.booleanItemAnimation.animateTo({ opacity: 0 }, { duration: 3 / 4 }),
      // Play the control expansion animation for the results of the branch instruction
      this.controlExpandAnimation.animate()
    ]);
    this.destroy();
  }

  destroy() {
    this.ref.current?.hide();
    this.booleanItemAnimation.destroy();
    this.controlExpandAnimation.destroy();
  }
}
