import React from 'react';

import { Visible } from '../../components/Visible';
import { CompactReferenceType, Data } from '../../CseMachineTypes';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible {
  /** draw logic */
  abstract draw(): React.ReactNode;
  /** add reference (binding / array unit) to this value */
  addReference(newReference: CompactReferenceType): void {
    this.referencedBy.push(newReference);
  }
  abstract updatePosition(pos?: { x: number; y: number }): void;

  /** references to this value */
  public referencedBy: CompactReferenceType[] = [];
  /** the underlying data of this value */
  abstract readonly data: Data;
}
