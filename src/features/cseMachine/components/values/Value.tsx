import React from 'react';

import { Data, ReferenceType } from '../../CseMachineTypes';
import { Visible } from '../Visible';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible {
  /** draw logic */
  abstract draw(): React.ReactNode;
  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.referencedBy.push(newReference);
  }
  abstract updatePosition(pos?: { x: number; y: number }): void;

  /** references to this value */
  public referencedBy: ReferenceType[] = [];
  /** the underlying data of this value */
  abstract readonly data: Data;
}
