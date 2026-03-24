import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow<FnValue | GlobalFnValue | ContValue, Frame> {
  //Removed the constructor as it is identical to the parent class as now 'faded' property is removed
  constructor(from: FnValue | GlobalFnValue | ContValue) {
    super(from);
    if (from instanceof GlobalFnValue)
      this.isLive = true; // Global functions are always live
    else this.isLive = from.isLive();
  }

  protected updateIsLive(): void {
    if (this.source instanceof GlobalFnValue) {
      this.isLive = true;
    } else {
      this.isLive = this.source.isLive();
    }
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
          ? [x, to.y() + Config.FnRadius]
          : [x, y - Config.FnRadius * 2],
      (x, y) => [to.x() + (from.x() < to.x() ? 0 : to.width()), y]
    ];

    return steps;
  }
}
