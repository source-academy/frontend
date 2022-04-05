import { CompactConfig } from '../../EnvVisualizerCompactConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { ArrayValue } from '../values/ArrayValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    if (to.x() < from.x()) {
      if (to instanceof ArrayValue) {
        steps.push((x, y) => [x + CompactConfig.TextMargin, y]);
        steps.push((x, y) => [x, to.y() - CompactConfig.DataUnitHeight / 3]);
        steps.push((x, y) => [to.x() + CompactConfig.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y()]);
      } else {
        steps.push((x, y) => [x + CompactConfig.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() / 2 - CompactConfig.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + CompactConfig.ArrowHeadSize, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - CompactConfig.ArrowHeadSize, y]);
      }
    } else {
      steps.push((x, y) => [
        to.x(),
        to.y() + (to instanceof ArrayValue ? CompactConfig.DataUnitHeight / 2 : 0)
      ]);
    }

    return steps;
  }
}
