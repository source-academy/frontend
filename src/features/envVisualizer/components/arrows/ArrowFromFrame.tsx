import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow {
  protected calculateSteps() {
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FramePaddingX, y]];

    if (to instanceof Frame) {
      steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
      steps.push((x, y) => [to.x() + Config.FramePaddingX, y]);
    }

    steps.push((x, y) => [to.x() + Config.FramePaddingX, to.y() + to.height()]);
    return steps;
  }
}
