import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow {
  protected calculateSteps() {
    const source = this.source;
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FnRadius * 3, y]];

    if (target.y() < source.y() && source.y() < target.y() + target.height()) {
      steps.push((x, y) => [x, y - Config.FnRadius * 2]);
      steps.push((x, y) => [target.x() + (source.x() < target.x() ? 0 : target.width()), y]);
    } else {
      steps.push((x, y) => [target.x() + target.width() / 2, y]);
      steps.push((x, y) => [x, target.y() + (target.y() < source.y() ? target.height() : 0)]);
    }

    return steps;
  }
}
