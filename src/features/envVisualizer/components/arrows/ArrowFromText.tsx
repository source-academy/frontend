import { Config } from '../../EnvVisualizerConfig';
import { ArrayValue } from '../values/ArrayValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow {
  protected calculatePoints() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    return [
      from.x + from.width,
      from.y + from.height / 2,
      to.x,
      to.y + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)
    ];
  }
}
