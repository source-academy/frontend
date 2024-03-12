import { CompactConfig } from '../../CseMachineCompactConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow<ArrayUnit, Value> {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + CompactConfig.DataUnitWidth / 2, y + CompactConfig.DataUnitHeight / 2]
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue) {
      steps.push(() => [from.x() < to.x() ? to.x() : to.centerX, to.y()]);
    } else if (to instanceof ArrayValue) {
      if (from.y() === to.y()) {
        if (Math.abs(from.x() - to.x()) > CompactConfig.DataUnitWidth * 2) {
          steps.push((x, y) => [x, y - CompactConfig.DataUnitHeight]);
          steps.push(() => [
            to.x() + CompactConfig.DataUnitWidth / 2,
            to.y() - CompactConfig.DataUnitHeight / 2
          ]);
          steps.push((x, y) => [x, y + CompactConfig.DataUnitHeight / 2]);
        } else {
          steps.push(() => [to.x(), to.y() + CompactConfig.DataUnitHeight / 2]);
        }
      } else {
        steps.push(() => [
          to.x() + CompactConfig.DataUnitWidth / 2,
          to.y() + (from.y() > to.y() ? CompactConfig.DataUnitHeight : 0)
        ]);
      }
    }

    return steps;
  }
}
