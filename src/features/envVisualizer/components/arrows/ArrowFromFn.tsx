import { Config } from '../../EnvVisualizerConfig';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow {
  protected calculatePoints() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    if (to.y < from.y && from.y < to.y + to.height) {
      return [
        from.x + Config.FnRadius * 3,
        from.y,
        from.x + Config.FnRadius * 3,
        from.y - Config.FnRadius * 2,
        to.x + from.x < to.x ? 0 : to.width,
        from.y - Config.FnRadius * 2
      ];
    }

    return [
      from.x + Config.FnRadius * 3,
      from.y,
      to.x + to.width / 2,
      to.y + to.y < from.y ? to.height : 0
    ];
  }
}
