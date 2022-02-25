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
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + Config.FramePaddingX, y]];
    const differentiateByParentFrame = true;
    if (to instanceof Frame) {
      // To differentiate frames pointing to different parent frames
      if (differentiateByParentFrame) {
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
      } else {
        steps.push((x, y) => [x, y - Config.FrameMarginY]);
      }
      steps.push((x, y) => [to.x() + Config.FramePaddingX, y]);
    }

    steps.push((x, y) => [to.x() + Config.FramePaddingX, to.y() + to.height()]);
    return steps;
  }
  protected getStrokeWidth(): number {
    return Number(Config.FrameArrowStrokeWidth);
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget, {
      strokeWidth: Number(Config.FrameArrowStrokeWidth)
    });
  };

  onClick = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    this.selected = !this.selected;
    if (!this.selected) {
      if (!(this.from instanceof Frame && this.from.isSelected())) {
        setUnhoveredStyle(currentTarget, {
          strokeWidth: this.getStrokeWidth()
        });
      }
    }
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (!this.selected) {
      if (!(this.from instanceof Frame && this.from.isSelected())) {
        setUnhoveredStyle(currentTarget, {
          strokeWidth: this.getStrokeWidth()
        });
      }
    } else {
      const container = currentTarget.getStage()?.container();
      container && (container.style.cursor = 'default');
    }
  };
}
