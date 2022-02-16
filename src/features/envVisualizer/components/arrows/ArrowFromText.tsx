import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow {
  protected calculateSteps() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    const offset = to.y() / to.x() + to.x() / to.y();
    const offsetX = from.x() / to.x();
    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];
    if (to instanceof ArrayValue) {
      if (to.x() < from.x()) {
        // move to the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin - offset]);
        steps.push((x, y) => [
          Frame.cumWidths[Frame.lastXCoordBelow(x)] - 2 * offsetX * Config.FramePaddingX,
          y
        ]);
        // move to 1/6 height of array below / above arrays before moving left.
        steps.push((x, y) => [
          x,
          to.y() +
            (1 / 2 - (4 / 6) * Math.sign(to.y() - from.y())) * (Config.DataUnitHeight + 3 * offset)
        ]);
        steps.push((x, y) => [
          to.x() + to.units.length * Config.DataUnitWidth + Config.DataUnitWidth / 2,
          y
        ]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x() + to.units.length * Config.DataUnitWidth, y]);
      } else {
        // move to left of frame to the right.
        steps.push((x, y) => [
          Frame.cumWidths[Frame.lastXCoordBelow(x) + 1] - 4 * offsetX * Config.FramePaddingX,
          y
        ]);
        // move to 1/3 height of array below / above arrays before moving right
        steps.push((x, y) => [
          x,
          to.y() +
            (1 / 2 - (5 / 6) * Math.sign(to.y() - from.y())) * (Config.DataUnitHeight + 3 * offset)
        ]);
        steps.push((x, y) => [to.x() - Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x(), y]);
      }
    } else if (to instanceof FnValue || to instanceof GlobalFnValue) {
      if (to.x() < from.x()) {
        // move to the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin - offset]);
        steps.push((x, y) => [
          Frame.cumWidths[Frame.cumWidths.findIndex(v => v > to.x())] -
            (2 / 3) * Config.FramePaddingX -
            15 * offset,
          y
        ]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x() + to.width(), y]);
      } else {
        if (Math.abs(to.y() - from.y()) < to.height() / 2) {
          steps.push((x, y) => [to.x(), y]);
          steps.push((x, y) => [x, to.y()]);
        } else {
          steps.push((x, y) => [
            Frame.cumWidths[Frame.lastXCoordBelow(x) + 1] - 15 * offsetX * Config.FramePaddingX,
            y
          ]);
          const fnReference = to.referencedBy[0];
          if (fnReference instanceof Binding) {
            steps.push((x, y) => [
              x,
              fnReference.frame.y() + fnReference.frame.height() + Config.FrameMarginY
            ]);
          } else {
            steps.push((x, y) => [x, to.y() + 3 * to.height()]);
          }
          steps.push((x, y) => [Math.max(x, to.x() + 2 * to.width()), y]);
          steps.push((x, y) => [x, to.y()]);
          steps.push((x, y) => [to.x() + to.width(), y]);
        }
      }
    } else {
      if (to.x() < from.x()) {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin - offset]);
        steps.push((x, y) => [
          Frame.cumWidths[Frame.cumWidths.findIndex(v => v > to.x())] -
            (2 / 3) * Config.FramePaddingX -
            15 * offset,
          y
        ]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x() + to.width(), y]);
      } else {
        if (to.x() < from.x() + Config.FrameMinWidth + Config.ArrowHeadSize) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
        } else {
          steps.push((x, y) => [x + Config.FrameMinWidth, y]);
        }
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x(), y]);
      }
    }
    return steps;
  }
}
