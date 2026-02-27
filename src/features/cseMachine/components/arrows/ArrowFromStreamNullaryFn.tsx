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
      (x, y) => [from.x() + from.width(), from.y()]
    ];
    steps.push(() => [to.x(), to.y() + Config.DataUnitHeight / 2]);

    return steps;
  }
}
