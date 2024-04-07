import React from 'react';

import { Data, ReferenceType } from '../../CseMachineTypes';
import { Visible } from '../Visible';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible {
  /** the underlying data of this value */
  abstract readonly data: Data;

  /** if the value does not have active references, i.e. it should be garbage collected */
  private _unreferenced: boolean = false;
  get unreferenced() {
    return this._unreferenced;
  }
  set unreferenced(value: boolean) {
    this._unreferenced = value;
  }

  /** references to this value */
  public references: ReferenceType[] = [];

  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.references.push(newReference);
    this.handleNewReference(newReference);
  }

  /** additional logic to handle new references */
  abstract handleNewReference(newReference: ReferenceType): void;

  /** draw logic */
  abstract draw(): React.ReactNode;
}
