import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { Layout } from '../EnvVisualizerLayout';
import { Animatable, AnimatedTextbox} from './AnimationComponents';
import { getNodeValuesFromItem } from './AnimationUtils';

export class LiteralAnimation extends Animatable {
  controlItem: ControlItemComponent;
  stashItem: StashItemComponent;
  animatedLiteral: AnimatedTextbox;

  constructor(
    controlItem: ControlItemComponent,
    stashItem: StashItemComponent,
  ) {
    super();
    this.controlItem = controlItem;
    this.stashItem = stashItem;
    const from = getNodeValuesFromItem(controlItem);
    const to = getNodeValuesFromItem(stashItem);
    this.animatedLiteral = new AnimatedTextbox(from, to, controlItem.text);
  }

  draw(): React.ReactNode {
    Animatable.key++;
    return (
      <Group key={Layout.key + Animatable.key} ref={this.ref}>
        {this.animatedLiteral.draw()}
      </Group>
    );
  }

  async animate() {
    this.stashItem.ref.current.hide();
    await Promise.all([this.animatedLiteral.animate()]);
    this.ref.current.hide();
    this.stashItem.ref.current.show();
  }

  destroy() {
    this.animatedLiteral.destroy();
  }
}
