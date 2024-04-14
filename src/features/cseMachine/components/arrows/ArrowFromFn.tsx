import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow<FnValue | GlobalFnValue, Frame> {
  constructor(from: FnValue | GlobalFnValue) {
    super(from);
    this.faded = !from.isReferenced();
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + Config.FnRadius * 3, y],
      (x, y) => [x, y - Config.FnRadius * 2],
      (x, y) => [to.x() + (from.x() < to.x() ? 0 : to.width()), y]
    ];

    return steps;
  }
}
