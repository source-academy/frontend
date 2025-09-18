import React from 'react';

import { Visible } from '../../../components/Visible';
import { CseMachine } from '../../CseMachine';

export class MemorySegment extends Visible {
  leftPointer: integer;
  rightPointer: integer;

  constructor(
    leftPointer: integer,
    rightPointer: integer,
    readonly highlightOnHover?: () => void,
    readonly unhighlightOnHover?: () => void
  ) {
    super();

    this.leftPointer = leftPointer;
    this.rightPointer = rightPointer;
  }

  draw(): React.ReactNode {
    return <div key={CseMachine.key++}>MEMORY SEGMENT</div>;
  }
}
