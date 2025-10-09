import React from 'react';
import { Group } from 'react-konva';
import { Stash as CStash, StashItem as CStashItem } from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { defaultTextColor } from '../../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CseMachine } from '../../CseMachine';
// import { Method } from './Method';
import { StashItem } from './StashItem';
// import { Variable } from './Variable';

export class Stash extends Visible {
  private readonly _stashItems: StashItem[] = [];

  constructor(stash: CStash) {
    super();

    // Position.
    this._x = CControlStashMemoryConfig.StashPosX;
    this._y = CControlStashMemoryConfig.StashPosY;

    // Create each StashItem.
    let stashItemX: number = this._x;
    for (const stashItem of stash.getStack()) {
      const stashItemText = this.getStashItemString(stashItem);
      const stashItemStroke = defaultTextColor();
      //   const stashItemReference = this.getStashItemRef(stashItem);
      const currStashItem = new StashItem(
        stashItemX,
        stashItemText,
        stashItemStroke
        // stashItemReference
      );

      this._stashItems.push(currStashItem);
      stashItemX += currStashItem.width();
    }

    // Height and width.
    this._height = CControlStashMemoryConfig.StashItemHeight;
    this._width = stashItemX - this._x;
  }

  draw(): React.ReactNode {
    return <Group key={CseMachine.key++}>{this._stashItems.map(s => s.draw())}</Group>;
  }

  private getStashItemString = (stashItem: CStashItem): string => {
    switch (stashItem.type) {
      case 'IntegerConstant':
        return stashItem.value.toString();
      case 'FloatConstant':
        return stashItem.value.toString();
      case 'FunctionTableIndex': {
        const index = stashItem.index;
        if (
          !CseMachine.functions ||
          index.value < 0 ||
          index.value > CseMachine.functions.length - 1
        ) {
          throw new Error('Index of desired function is out of bounds or functions are undefined');
        }

        const functionName = CseMachine.functions[Number(index.value)];
        return functionName.functionName;
      }
      case 'MemoryAddress':
        return `0x${stashItem.value.toString(16).padStart(2, '0').toUpperCase()}`;
    }
  };

  //   private getStashItemRef = (stashItem: ECE.StashItem) => {
  //     return stashItem.kind === ECE.StructType.CLOSURE
  //       ? CseMachine.environment &&
  //           (CseMachine.environment.classes
  //             .flatMap(c => c.bindings)
  //             .find(b => b.value instanceof Method && b.value.method === stashItem)?.value as Method)
  //       : stashItem.kind === ECE.StructType.VARIABLE
  //         ? CseMachine.environment &&
  //           ((CseMachine.environment.frames
  //             .flatMap(c => c.bindings)
  //             .find(b => b.value instanceof Variable && b.value.variable === stashItem)
  //             ?.value as Variable) ||
  //             (CseMachine.environment.classes
  //               .flatMap(c => c.bindings)
  //               .find(b => b.value instanceof Variable && b.value.variable === stashItem)
  //               ?.value as Variable) ||
  //             (CseMachine.environment.objects
  //               .flatMap(o => o.bindings)
  //               .find(b => b.value instanceof Variable && b.value.variable === stashItem)
  //               ?.value as Variable))
  //         : stashItem.kind === ECE.StructType.CLASS
  //           ? CseMachine.environment &&
  //             CseMachine.environment.classes.find(c => c.frame === stashItem.frame)
  //           : stashItem.kind === ECE.StructType.OBJECT
  //             ? CseMachine.environment &&
  //               CseMachine.environment.objects.find(o => o.frame === stashItem.frame)
  //             : undefined;
  //   };
}
