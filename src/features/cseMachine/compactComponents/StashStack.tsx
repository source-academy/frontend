import { Stash } from 'js-slang/dist/cse-machine/interpreter';
import { Value } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../components/Visible';
import CseMachine from '../CseMachine';
import { ControlStashConfig } from '../CseMachineControlStash';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import { getStashItemComponent } from '../CseMachineUtils';
import { StashItemComponent } from './StashItemComponent';

export class StashStack extends Visible implements IHoverable {
  /** array of stash item components */
  readonly stashItemComponents: StashItemComponent[];

  constructor(
    /** the stash object */
    readonly stash: Stash
  ) {
    super();
    this._x = ControlStashConfig.StashPosX;
    this._y = ControlStashConfig.StashPosY;
    this._width = 0;
    this._height = 0;

    // Function to convert the stack items to their components
    let i = 0;
    const stashItemToComponent = (stashItem: Value) => {
      const component = getStashItemComponent(stashItem, this._width, i);
      this._width += component.width();
      this._height = Math.max(this._height, component.height());
      i += 1;
      return component;
    };
    this.stashItemComponents = this.stash
      .getStack()
      .slice(CseMachine.getStackTruncated() ? -10 : 0)
      .map(stashItemToComponent);
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {this.stashItemComponents.map(c => c?.draw())}
      </Group>
    );
  }
}
