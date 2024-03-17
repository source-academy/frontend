import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { AssignmentAnimation } from './AssignmentAnimation';
import { Animatable } from './base/Animatable';
import { FrameCreationAnimation } from './FrameCreationAnimation';

export class FunctionFrameCreationAnimation extends Animatable {
  private frameCreationAnimation: FrameCreationAnimation;
  private assignmentAnimations: AssignmentAnimation[];

  constructor(
    private currFrame: Frame,
    controlItem: ControlItemComponent,
    closureStashItem: StashItemComponent,
    argStashItems: StashItemComponent[]
  ) {
    super();
    this.frameCreationAnimation = new FrameCreationAnimation(currFrame, controlItem);

    let index = 0
    this.assignmentAnimations = currFrame.bindings.map(binding => {
      return new AssignmentAnimation(
        closureStashItem, argStashItems.at(index++)!, currFrame, binding
      )
    });
  }

  draw(): React.ReactNode {
    return (
      <Group key={Animatable.key--} ref={this.ref}>
        {this.frameCreationAnimation.draw()}
        {this.assignmentAnimations.map(a => a.draw())}
      </Group>
    );
  }

  async animate() {
    await this.frameCreationAnimation.animate();
    await Promise.all([this.assignmentAnimations.map(a => a.animate())]);
  }

  destroy() {
    this.currFrame.ref.current?.show();
    this.frameCreationAnimation.destroy();
    this.assignmentAnimations.map(a => a.destroy());
  }
}
