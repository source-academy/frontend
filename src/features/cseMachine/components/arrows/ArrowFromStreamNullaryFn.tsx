import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { DottedArrow } from './DottedArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStreamNullaryFn extends DottedArrow {
  constructor(from: FnValue | GlobalFnValue | ContValue) {
    super(from);
    this.faded = !from.isReferenced();
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) =>
        this.source instanceof ContValue
          ? [x + Config.FnRadius * 2, y]
          : [x + Config.FnRadius * 3, y],
      (x, y) =>
        this.source instanceof ContValue
          ? [x, to.y()]
          : [x, y - Config.FnRadius * 2],
      (x, y) => [to.x() + (from.x() < to.x() ? 0 : to.width()), y]
    ];

    return steps;
  }
}
