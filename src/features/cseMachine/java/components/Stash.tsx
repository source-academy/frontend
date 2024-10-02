import { ECE } from 'java-slang';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../../components/Visible';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { defaultTextColor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { Method } from './Method';
import { StashItem } from './StashItem';
import { Variable } from './Variable';

export class Stash extends Visible {
  private readonly _stashItems: StashItem[] = [];

  constructor(stash: ECE.Stash) {
    super();

    // Position.
    this._x = ControlStashConfig.StashPosX;
    this._y = ControlStashConfig.StashPosY;

    // Create each StashItem.
    let stashItemX: number = this._x;
    for (const stashItem of stash.getStack()) {
      const stashItemText = this.getStashItemString(stashItem);
      const stashItemStroke = defaultTextColor();
      const stashItemReference = this.getStashItemRef(stashItem);
      const currStashItem = new StashItem(
        stashItemX,
        stashItemText,
        stashItemStroke,
        stashItemReference
      );

      this._stashItems.push(currStashItem);
      stashItemX += currStashItem.width();
    }

    // Height and width.
    this._height = ControlStashConfig.StashItemHeight;
    this._width = stashItemX - this._x;
  }

  draw(): React.ReactNode {
    return <Group key={CseMachine.key++}>{this._stashItems.map(s => s.draw())}</Group>;
  }

  private getStashItemString = (stashItem: ECE.StashItem): string => {
    switch (stashItem.kind) {
      case 'Literal':
        return stashItem.literalType.value;
      case ECE.StructType.VARIABLE:
        return 'location';
      case ECE.StructType.TYPE:
        return stashItem.type;
      default:
        return stashItem.kind.toLowerCase();
    }
  };

  private getStashItemRef = (stashItem: ECE.StashItem) => {
    return stashItem.kind === ECE.StructType.CLOSURE
      ? CseMachine.environment &&
          (CseMachine.environment.classes
            .flatMap(c => c.bindings)
            .find(b => b.value instanceof Method && b.value.method === stashItem)?.value as Method)
      : stashItem.kind === ECE.StructType.VARIABLE
        ? CseMachine.environment &&
          ((CseMachine.environment.frames
            .flatMap(c => c.bindings)
            .find(b => b.value instanceof Variable && b.value.variable === stashItem)
            ?.value as Variable) ||
            (CseMachine.environment.classes
              .flatMap(c => c.bindings)
              .find(b => b.value instanceof Variable && b.value.variable === stashItem)
              ?.value as Variable) ||
            (CseMachine.environment.objects
              .flatMap(o => o.bindings)
              .find(b => b.value instanceof Variable && b.value.variable === stashItem)
              ?.value as Variable))
        : stashItem.kind === ECE.StructType.CLASS
          ? CseMachine.environment &&
            CseMachine.environment.classes.find(c => c.frame === stashItem.frame)
          : stashItem.kind === ECE.StructType.OBJECT
            ? CseMachine.environment &&
              CseMachine.environment.objects.find(o => o.frame === stashItem.frame)
            : undefined;
  };
}
