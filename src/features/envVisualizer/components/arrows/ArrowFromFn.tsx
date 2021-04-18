import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow {
  protected calculateSteps() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FnRadius * 3, y]];

    if (to.y < from.y && from.y < to.y + to.height) {
      steps.push((x, y) => [x, y - Config.FnRadius * 2]);
      steps.push((x, y) => [to.x + (from.x < to.x ? 0 : to.width), y]);
    } else {
      steps.push((x, y) => [to.x + to.width / 2, to.y + (to.y < from.y ? to.height : 0)]);
    }

    return steps;
  }
}
