import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Layout } from '../EnvVisualizerLayout';
import { Animatable, AnimatedTextbox} from './AnimationComponents';
import { getNodeValuesFromItem } from './AnimationUtils';

export class BlockAnimation extends Animatable {
  block: ControlItemComponent;
  resultantItems: ControlItemComponent[];
  animatedBlock: AnimatedTextbox;
  animatedResultantItems: AnimatedTextbox[];

  constructor(
    block: ControlItemComponent,
    resultantItems: ControlItemComponent[]
  ) {
    super();
    this.block = block;
    this.resultantItems = resultantItems;
    const from = getNodeValuesFromItem(this.block);
    this.animatedBlock = new AnimatedTextbox(from, {opacity:0}, block.text);
    this.animatedResultantItems = [];
    for (let i = 0; i < resultantItems.length; i++) {
      const resultantItem = resultantItems[i];
      const result_to = getNodeValuesFromItem(resultantItem);
      const animatedResultantItem = new AnimatedTextbox(from, result_to, resultantItem.text);
      this.animatedResultantItems.push(animatedResultantItem);
    }
  }

  // TODO: add all the items from animatedResultantItems into the group
  draw(): React.ReactNode {
    Animatable.key++;
    return (
      <Group key={Layout.key + Animatable.key} ref={this.ref}>
        {this.animatedBlock.draw()}
        {this.animatedResultantItems[0].draw()}
      </Group>
    );
  }

  async animate() {
    // for (let i = 0; i < this.resultantItems.length; i++) {
    //   this.resultantItems[i].ref.current.hide();
    // }
    this.resultantItems[0].ref.current.hide()
    await Promise.all([this.animatedBlock.animate(), this.animatedResultantItems[0].animate()]);
    // for (let i = 0; i < this.resultantItems.length; i++) {
    //   this.resultantItems[i].ref.current.show();
    // }
    this.resultantItems[0].ref.current.show()
  }

  destroy() {
    this.ref.current.destroy();
  }
}
