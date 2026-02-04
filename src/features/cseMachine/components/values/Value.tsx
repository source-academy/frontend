import React from 'react';

import { Data, ReferenceType } from '../../CseMachineTypes';
import { isDummyReference } from '../../CseMachineUtils';
import { Visible } from '../Visible';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible {
  /** the underlying data of this value */
  abstract readonly data: Data;

  /**
   * if the value has actual references, i.e. the references
   * are not from dummy bindings or from unreferenced arrays
   */
  private _isReferenced: boolean = false;

  isReferenced() {
    return this._isReferenced;
  }

  markAsReferenced() {
    this._isReferenced = true;
  }

  /** references to this value */
  public references: ReferenceType[] = [];

  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.references.push(newReference);
    this.handleNewReference(newReference);
    if (!this.isReferenced() && !isDummyReference(newReference)) {
      this.markAsReferenced();
    }
  }

  /** additional logic to handle new references */
  abstract handleNewReference(newReference: ReferenceType): void;

  /** draw logic */
  abstract draw(): React.ReactNode;
}
