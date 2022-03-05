import { KonvaEventObject } from 'konva/lib/Node';

import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../EnvVisualizerUtils';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow {
  protected calculateSteps() {
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FramePaddingX, y]];
    const differentiateByParentFrame = true;
    if (target instanceof Frame) {
      // To differentiate frames pointing to different parent frames
      if (differentiateByParentFrame) {
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(target, y).getPosition(target)]);
      } else {
        steps.push((x, y) => [x, y - Config.FrameMarginY]);
      }
      steps.push((x, y) => [target.x() + Config.FramePaddingX, y]);
    }

    steps.push((x, y) => [target.x() + Config.FramePaddingX, target.y() + target.height()]);
    return steps;
  }
  static getStrokeWidth(): number {
    return Number(Config.FrameArrowStrokeWidth);
  }

  onMouseEnter(e: KonvaEventObject<MouseEvent>) {
    super.onMouseEnter(e);
    setHoveredStyle(e.currentTarget, {
      strokeWidth: Number(Config.FrameArrowHoveredStrokeWidth)
    });
  }

  onMouseLeave(e: KonvaEventObject<MouseEvent>) {
    super.onMouseLeave(e);
    if (!this.selected) {
      if (!(this.source instanceof Frame && this.source.isSelected())) {
        setUnhoveredStyle(e.currentTarget, {
          strokeWidth: ArrowFromFrame.getStrokeWidth()
        });
      }
    }
  }
}
