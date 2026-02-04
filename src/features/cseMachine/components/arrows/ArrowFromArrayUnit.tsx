import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrayValue } from '../values/ArrayValue';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow<ArrayUnit, Value> {
  constructor(from: ArrayUnit) {
    super(from);
    this.faded = !from.parent.isReferenced();
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + Config.DataUnitWidth / 2, y + Config.DataUnitHeight / 2]
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue || to instanceof ContValue) {
      steps.push(() => [from.x() < to.x() ? to.x() : to.centerX, to.y()]);
    } else if (to instanceof ArrayValue) {
      if (from.y() === to.y()) {
        if (from.isLastUnit && to.x() > from.x() && to.x() <= from.x() + Config.DataUnitWidth * 2) {
          // Horizontal arrow that follows box-and-pointer notation for lists
          steps.push(() => [to.x(), to.y() + Config.DataUnitHeight / 2]);
        } else if (Math.abs(from.x() - to.x()) < Config.DataUnitWidth / 2) {
          // Longer circular arrow for arrows pointing back to the same spot
          steps.push((x, y) => [x, y - Config.DataUnitHeight]);
          steps.push(() => [to.x() - Config.DataUnitWidth / 2, to.y() - Config.DataUnitHeight / 2]);
          steps.push((x, y) => [x, y + (Config.DataUnitHeight * 2) / 3]);
          steps.push((x, y) => [x + Config.DataUnitWidth / 2, y]);
        } else {
          // Standard arrow that curves upwards first before pointing to the target
          steps.push((x, y) => [x, y - Config.DataUnitHeight]);
          steps.push(() => [to.x() + Config.DataUnitWidth / 2, to.y() - Config.DataUnitHeight / 2]);
          steps.push((x, y) => [x, y + Config.DataUnitHeight / 2]);
        }
      } else {
        // Straight arrow that points directly to the target
        steps.push(() => [
          to.x() + Config.DataUnitWidth / 2,
          to.y() + (from.y() > to.y() ? Config.DataUnitHeight : 0)
        ]);
      }
    }

    return steps;
  }
}
