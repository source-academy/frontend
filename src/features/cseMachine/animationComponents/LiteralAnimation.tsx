import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
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

  async animate() {
    this.stashItem.ref.current.hide();
    await this.animation.animateTo(getNodePosition(this.stashItem));
    this.destroy();
  }

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Animatable.key--}>
        {this.animation.draw()}
      </Group>
    );
  }

  destroy() {
    this.stashItem.ref.current?.show();
    this.ref.current?.hide();
    this.animation.destroy();
  }
}
