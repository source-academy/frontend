import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { ArrayValue } from '../values/ArrayValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow {
  protected calculateSteps() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + from.width, y + from.height / 2]];

    if (to.x < from.x) {
      steps.push((x, y) => [x + Config.TextMargin, y]);
      steps.push((x, y) => [x, y - from.height / 2 - Config.TextMargin]);
      steps.push((x, y) => [
        to.x + (to instanceof ArrayValue ? Config.DataUnitWidth : to.width) + Config.ArrowHeadSize,
        y
      ]);
      steps.push((x, y) => [x, to.y + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)]);
      steps.push((x, y) => [x - Config.ArrowHeadSize, y]);
    } else {
      steps.push((x, y) => [
        to.x,
        to.y + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)
      ]);
    }

    return steps;
  }
}
