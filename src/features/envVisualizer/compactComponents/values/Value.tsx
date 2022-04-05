import { RefObject } from 'react';

import { CompactReferenceType, Data, Visible } from '../../EnvVisualizerTypes';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value implements Visible {
  /** coordinates and dimensions */
  abstract x(): number;
  abstract y(): number;
  abstract height(): number;
  abstract width(): number;
  abstract isDrawn(): boolean;
  abstract reset(): void;
  ref?: RefObject<any> | undefined;
  /** draw logic */
  abstract draw(): React.ReactNode;
  /** add reference (binding / array unit) to this value */
  addReference(newReference: CompactReferenceType): void {
    this.referencedBy.push(newReference);
  }
  abstract updatePosition(pos?: { x: number; y: number }): void;

  /** references to this value */
  abstract referencedBy: CompactReferenceType[];
  /** the underlying data of this value */
  abstract readonly data: Data;
}
