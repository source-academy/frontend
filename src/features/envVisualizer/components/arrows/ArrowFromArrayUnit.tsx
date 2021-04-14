import { Config } from '../../EnvVisualizerConfig';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow {
  protected calculatePoints() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    this.points = [from.x + Config.DataUnitWidth / 2, from.y + Config.DataUnitHeight / 2];
    if (to instanceof FnValue || to instanceof GlobalFnValue) {
      if (from.x < to.x) this.points.push(to.x, to.y);
      else this.points.push(to.centerX, to.y);
    } else if (to instanceof ArrayValue) {
      if (from.y === to.y && Math.abs(from.x - to.x) > Config.DataUnitWidth * 2) {
        this.points.push(
          from.x + Config.DataUnitWidth / 2,
          from.y - Config.DataUnitHeight / 2,
          to.x + Config.DataUnitWidth / 2,
          to.y - Config.DataUnitHeight / 2,
          to.x + Config.DataUnitWidth / 2,
          to.y
        );
      } else if (from.y < to.y) {
        this.points.push(to.x + Config.DataUnitWidth / 2, to.y);
      } else if (from.y > to.y) {
        this.points.push(to.x + Config.DataUnitWidth / 2, to.y + Config.DataUnitHeight);
      } else {
        this.points.push(to.x, to.y + Config.DataUnitHeight / 2);
      }
    } else {
      this.points.push(to.x, to.y);
    }

    return this.points;
  }
}
