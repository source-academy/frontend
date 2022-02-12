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

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    if (to.x() < from.x()) {
      if (to instanceof ArrayValue) {
        if (0 < to.y() - from.y() && to.y() - from.y() < Config.ArrowMinHeight) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
        } else {
          steps.push((x, y) => [x + (3 / 5) * Config.FrameMinWidth, y]);
        }
        steps.push((x, y) => [x, to.y() + (4 / 3) * Config.DataUnitHeight]);
        steps.push((x, y) => [to.x() - Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x(), y]);
      } else {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + 4 * Config.ArrowHeadSize, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - 4 * Config.ArrowHeadSize, y]);
      }
    } else {
      if (to.x() - from.x() < Config.FrameMinWidth + Config.ArrowHeadSize) {
        steps.push((x, y) => [x + Config.TextMargin, y]);
      } else {
        steps.push((x, y) => [x + (2 / 3) * Config.FrameMinWidth, y]);
      }
      steps.push((x, y) => [
        x,
        to.y() + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)
      ]);
      steps.push((x, y) => [to.x(), y]);
    }
    return steps;
  }
}
