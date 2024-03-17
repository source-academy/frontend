import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { Animatable } from './base/Animatable';
import { AnimatedTextbox } from './base/AnimatedTextbox';
import { getNodePosition } from './base/AnimationUtils';

export class LiteralAnimation extends Animatable {
  private animation: AnimatedTextbox;

  constructor(
    controlItem: ControlItemComponent,
    private stashItem: StashItemComponent
  ) {
    super();
    this.animation = new AnimatedTextbox(controlItem.text, getNodePosition(controlItem));
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.animation.draw()}
      </Group>
    );
  }

  async animate() {
    this.stashItem.ref.current.hide();
    await this.animation.animateTo(getNodePosition(this.stashItem));
    this.destroy();
  }

  destroy() {
    this.stashItem.ref.current?.show();
    this.ref.current?.hide();
    this.animation.destroy();
  }
}
