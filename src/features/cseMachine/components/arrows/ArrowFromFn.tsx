import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow<FnValue | GlobalFnValue, Frame> {
  protected calculateSteps() {
    const source = this.source;
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FnRadius * 3, y]];

    if (target.y() < source.y() && source.y() < target.y() + target.height()) {
      steps.push((x, y) => [x, y - Config.FnRadius * 2]);
      steps.push((x, y) => [target.x() + (source.x() < target.x() ? 0 : target.width()), y]);
    } else {
      steps.push((x, y) => [x, y - Config.FnRadius * 2]);
      steps.push((x, y) => [
        ArrowLane.getVerticalLaneBeforeTarget(source, x).getPosition(source),
        y
      ]);
      steps.push((x, y) => [
        x,
        ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
      ]);
      steps.push((x, y) => [target.x() + (target.x() < x ? target.width() : 0), y]);
      steps.push((x, y) => [x, target.y() + (target.y() < source.y() ? target.height() : 0)]);
    }

    return steps;
  }
}
