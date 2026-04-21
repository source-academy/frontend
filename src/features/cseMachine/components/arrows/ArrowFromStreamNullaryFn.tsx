import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrayValue } from '../values/ArrayValue';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { DottedArrow } from './DottedArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStreamNullaryFn extends DottedArrow {
  constructor(
    from: FnValue | GlobalFnValue | ContValue,
    public offsetIndex: number = 0
  ) {
    super(from);
    this.faded = !from.isReferenced();
  }

  protected calculateSteps() {
    const from = this.source as FnValue | GlobalFnValue | ContValue;
    const to = this.target;

    if (!to || !(to instanceof ArrayValue)) return [];

    const verticalShift = this.offsetIndex * 20; // 20px vertical separation for multiple arrows to the same target

    // The arrow starts from the right of the function circle
    const startPointX = from.centerX + 2 * from.radius;
    const startPointY = from.y();
    // The arrow ends at the top-center of the array
    const endPointX = to.x() + Config.DataUnitWidth / 2;
    const endPointY = to.y();

    // An intermediate point is used to create the arch.
    // It is placed horizontally between the start and end points,
    // and vertically above them to form an upward arch.
    const midPointX = (startPointX + endPointX) / 2;
    const archHeight = 50;
    const midPointY = Math.min(startPointY, endPointY) - archHeight - verticalShift;
    const steps: StepsArray = [
      // The GenericArrow class will draw a path through these points,
      // creating smooth curves at the corners.
      () => [startPointX, startPointY],
      () => [midPointX, midPointY],
      () => [endPointX, endPointY]
    ];
    return steps;
  }
}
