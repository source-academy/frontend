import { KonvaEventObject } from 'konva/lib/Node';

import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow<Frame, Frame> {
  protected calculateSteps() {
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FramePaddingX, y]];
    const differentiateByParentFrame = true;
    if (target instanceof Frame) {
      // To differentiate frames pointing to different parent frames
      if (differentiateByParentFrame) {
        steps.push((x, y) => [
          x,
          ArrowLane.getHorizontalLaneAfterSource(target, y).getPosition(target)
        ]);
      } else {
        steps.push((x, y) => [x, y - Config.FrameMarginY]);
      }
      steps.push((x, y) => [target.x() + Config.FramePaddingX, y]);
    }

    steps.push((x, y) => [target.x() + Config.FramePaddingX, target.y() + target.height()]);
    return steps;
  }

  getStrokeWidth(): number {
    return Number(Config.FrameArrowStrokeWidth);
  }

  onClick(e: KonvaEventObject<MouseEvent>) {
    super.onClick(e);
  }

  onMouseEnter(e: KonvaEventObject<MouseEvent>) {
    super.onMouseEnter(e);
  }

  onMouseLeave(e: KonvaEventObject<MouseEvent>) {
    super.onMouseLeave(e);
  }
}
