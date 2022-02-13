import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { Frame } from '../Frame';
import { ArrayValue } from '../values/ArrayValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow {
  protected calculateSteps() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];
    if (to instanceof ArrayValue) {
      if (to.x() < from.x()) {
        if (to.y() > from.y()) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
        } else {
          steps.push((x, y) => [x + (3 / 5) * Config.FrameMinWidth, y]);
        }
        // move horizontally 1/6 height of array below arrays when moving left
        steps.push((x, y) => [
          x,
          to.y() + (1 / 2 - (4 / 6) * Math.sign(to.y() - from.y())) * Config.DataUnitHeight
        ]);
        steps.push((x, y) => [
          to.x() + to.units.length * Config.DataUnitWidth + Config.DataUnitWidth / 2,
          y
        ]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x() + to.units.length * Config.DataUnitWidth, y]);
      } else {
        if (to.x() - from.x() < Config.FrameMinWidth + Config.ArrowHeadSize) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
        } else {
          steps.push((x, y) => [x + (2 / 3) * Config.FrameMinWidth, y]);
        }
        // moves horzontally 1/3 height of array below arrays when moving right
        steps.push((x, y) => [
          x,
          to.y() + (1 / 2 - (5 / 6) * Math.sign(to.y() - from.y())) * Config.DataUnitHeight
        ]);
        steps.push((x, y) => [to.x() - Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x(), y]);
      }
    } else {
      if (to.x() < from.x()) {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin]);
        steps.push((x, y) => [
          Frame.cumWidths[Frame.cumWidths.findIndex(v => v > to.x())] -
            (Config.FramePaddingX * 2) / 3,
          y
        ]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x() + to.width(), y]);
      } else {
        if (to.x() < from.x() + Config.FrameMinWidth + Config.ArrowHeadSize) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
        } else {
          steps.push((x, y) => [x + (2 / 3) * Config.FrameMinWidth, y]);
        }
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x(), y]);
      }
    }
    return steps;
  }
}
