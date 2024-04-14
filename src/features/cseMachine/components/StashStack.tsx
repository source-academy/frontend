import { Stash } from 'js-slang/dist/cse-machine/interpreter';
import { Chapter, Value } from 'js-slang/dist/types';
import React from 'react';

import CseMachine from '../CseMachine';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { getStashItemComponent } from '../CseMachineUtils';
import { StashItemComponent } from './StashItemComponent';
import { Visible } from './Visible';

export class StashStack extends Visible {
  /** array of stash item components */
  readonly stashItemComponents: StashItemComponent[];

  constructor(
    /** the stash object */
    readonly stash: Stash,
    readonly chapter: Chapter
  ) {
    super();
    this._x = ControlStashConfig.StashPosX;
    this._y = ControlStashConfig.StashPosY;
    this._width = 0;
    this._height = 0;
    this.chapter = chapter;

    // Function to convert the stack items to their components
    let i = 0;
    const stashItemToComponent = (stashItem: Value) => {
      const component = getStashItemComponent(stashItem, this._width, i, this.chapter);
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

  draw(): React.ReactNode {
    return <>{this.stashItemComponents.map(c => c?.draw())}</>;
  }
}
