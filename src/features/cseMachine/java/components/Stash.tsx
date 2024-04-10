import { Stash as JavaStash } from 'java-slang/dist/ec-evaluator/components';
import { StashItem as JavaStashItem, StructType } from 'java-slang/dist/ec-evaluator/types';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../../components/Visible';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { CseMachine } from '../CseMachine';
import { Method } from './Method';
import { StashItem } from './StashItem';
import { Variable } from './Variable';

export class Stash extends Visible {
  private readonly _stashItems: StashItem[] = [];

  constructor(stash: JavaStash) {
    super();

    // Position.
    this._x = ControlStashConfig.StashPosX;
    this._y = ControlStashConfig.StashPosY;

    // Create each StashItem.
    let stashItemX: number = this._x;
    for (const stashItem of stash.getStack()) {
      const stashItemText = this.getStashItemString(stashItem);
      const stashItemStroke = ControlStashConfig.SA_WHITE;
      const stashItemReference = this.getStashItemRef(stashItem);
      const currStashItem = new StashItem(
        stashItemX, 
        stashItemText,
        stashItemStroke,
        stashItemReference);

      this._stashItems.push(currStashItem);
      stashItemX += currStashItem.width();
    }

    // Height and width.
    this._height = ControlStashConfig.StashItemHeight;
    this._width = stashItemX - this._x;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++} >
        {this._stashItems.map(s => s.draw())}
      </Group>
    );
  }

  private getStashItemString = (stashItem: JavaStashItem): string => {
    switch (stashItem.kind) {
      case "Literal":
        return stashItem.literalType.value;
      case StructType.VARIABLE:
        return "location";
      case StructType.TYPE:
        return stashItem.type;
      default:
        return stashItem.kind.toLowerCase();
    }
  }

  private getStashItemRef = (stashItem: JavaStashItem) => {
    return stashItem.kind === StructType.CLOSURE
      ? CseMachine.environment &&
        CseMachine.environment.classes
          .flatMap(c => c.bindings)
          .find(b => b.value instanceof Method && b.value.method === stashItem)?.value as Method
      : stashItem.kind === StructType.VARIABLE
      ? CseMachine.environment && 
        (CseMachine.environment.frames
          .flatMap(c => c.bindings)
          .find(b => b.value instanceof Variable && b.value.variable === stashItem)?.value as Variable ||
        CseMachine.environment.classes
          .flatMap(c => c.bindings)
          .find(b => b.value instanceof Variable && b.value.variable === stashItem)?.value as Variable ||
        CseMachine.environment.objects
          .flatMap(o => o.bindings)
          .find(b => b.value instanceof Variable && b.value.variable === stashItem)?.value as Variable)
      : stashItem.kind === StructType.CLASS
      ? CseMachine.environment &&
        CseMachine.environment.classes.find(c => c.frame === stashItem.frame)
      : stashItem.kind === StructType.OBJECT
      ? CseMachine.environment &&
        CseMachine.environment.objects.find(o => o.frame === stashItem.frame)
      : undefined;
  }
}
