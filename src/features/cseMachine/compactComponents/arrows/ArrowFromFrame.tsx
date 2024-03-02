import { CompactConfig } from '../../CseMachineCompactConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow<Frame, Frame> {
  protected calculateSteps() {
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + CompactConfig.FramePaddingX, y]];

    if (to instanceof Frame) {
      steps.push((x, y) => [x, y - CompactConfig.FrameMarginY]);
      steps.push((x, y) => [to.x() + CompactConfig.FramePaddingX, y]);
    }

    steps.push((x, y) => [to.x() + CompactConfig.FramePaddingX, to.y() + to.height()]);
    return steps;
  }
}
