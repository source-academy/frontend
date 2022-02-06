import { Data, ReferenceType, Visible } from '../../EnvVisualizerTypes';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value implements Visible {
  /** draw logic */
  abstract draw(): React.ReactNode;
  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.referencedBy.push(newReference);
  }
  abstract updatePosition(pos?: { x: number; y: number }): void;

  /** references to this value */
  abstract readonly referencedBy: ReferenceType[];
  /** the underlying data of this value */
  abstract readonly data: Data;
  /** coordinates and dimensions */
  abstract x: number;
  abstract y: number;
  abstract readonly height: number;
  abstract readonly width: number;
}
