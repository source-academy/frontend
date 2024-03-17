import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow<Text, Value> {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    if (to.x() < from.x()) {
      if (to instanceof ArrayValue) {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, to.y() - Config.DataUnitHeight / 3]);
        steps.push((x, y) => [to.x() + Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y()]);
      } else {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() / 2 - Config.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + Config.ArrowHeadSize, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - Config.ArrowHeadSize, y]);
      }
    } else {
      steps.push((x, y) => [
        to.x(),
        to.y() + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)
      ]);
    }

    return steps;
  }
}
