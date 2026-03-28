import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { DottedArrow } from './DottedArrow';


/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStreamNullaryFn extends DottedArrow {
  // constructor(from: FnValue | GlobalFnValue | ContValue) {
  //   super(from);
  //   this.faded = !from.isReferenced();
  // }


  // protected calculateSteps() {
  //   const from = this.source;
  //   const to = this.target;
  //   if (!to) return [];

  //   const steps: StepsArray = [
  //     (x, y) => [from.x() + from.width(), from.y()]
  //   ];
  //   steps.push(() => [to.x(), to.y() + Config.DataUnitHeight / 2]);

  //   return steps;
  // }

    constructor(from: FnValue | GlobalFnValue | ContValue, public offsetIndex: number = 0) {
    super(from);
    this.faded = !from.isReferenced();
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    // Calculate a vertical shift (e.g., 10 pixels per duplicate arrow)
    const shift = this.offsetIndex * 10; 

    const steps: StepsArray = [
      (x, y) =>
        this.source instanceof ContValue
          ? [x + Config.FnRadius * 2, y + shift] // Apply shift to start Y
          : [x + Config.FnRadius * 3, y + shift], // Apply shift to start Y
      (x, y) =>
        this.source instanceof ContValue
          ? [x, to.y() + Config.FnRadius + shift]
          // Because 'y' here is the output of the previous step, it is ALREADY shifted. 
          // No need to add 'shift' again!
          : [x, y - Config.FnRadius * 2], 
      (x, y) => [to.x() + (from.x() < to.x() ? 0 : to.width()), y]
    ];

    return steps;
  }
}
