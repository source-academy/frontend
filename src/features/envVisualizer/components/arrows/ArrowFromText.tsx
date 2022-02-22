import { Config } from '../../EnvVisualizerConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { Grid } from '../Grid';
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

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];
    if (to instanceof ArrayValue) {
      if (to.x() < from.x()) {
        // move to the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin]);
        steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
        steps.push((x, y) => [
          to.x() +
            to.units.length * Config.DataUnitWidth +
            Config.DataUnitWidth / 2 +
            ((to.y() - (to?.level?.y() || to.y())) / Config.DataUnitHeight) * 3,
          y
        ]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x() + to.units.length * Config.DataUnitWidth, y]);
      } else {
        // move to left of frame to the right.
        steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
        steps.push((x, y) => [
          to.x() -
            Config.DataUnitWidth / 2 -
            ((to.y() - (to?.level?.y() || to.y())) / Config.DataUnitHeight) * 3,
          y
        ]);
        steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
        steps.push((x, y) => [to.x(), y]);
      }
    } else if (to instanceof FnValue || to instanceof GlobalFnValue) {
      if (to.x() < from.x()) {
        // move to the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin]);
        if (
          Grid.lastYCoordBelow(to.y()) === Grid.lastYCoordBelow(from.y()) &&
          Frame.lastXCoordBelow(from.x()) === Frame.lastXCoordBelow(to.x()) + 1
        ) {
          // Move directly to object
          steps.push((x, y) => [to.centerX + Config.FnRadius * 3, y]);
          steps.push((x, y) => [x, to.y()]);
          steps.push((x, y) => [x - Config.FnRadius, y]);
        } else {
          // vertical lane, horizontal lane, vertical lane,
          steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
          steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLane(
              to,
              Frame.cumWidths[Frame.lastXCoordBelow(to.x()) + 1]
            ).getPosition(to),
            y
          ]);
          steps.push((x, y) => [x, to.y()]);
          steps.push((x, y) => [to.centerX + Config.FnRadius * 2, y]);
        }
      } else {
        if (
          Grid.lastYCoordBelow(to.y()) === Grid.lastYCoordBelow(from.y()) &&
          Frame.lastXCoordBelow(from.x()) === Frame.lastXCoordBelow(to.x())
        ) {
          steps.push((x, y) => [to.x(), y]);
          steps.push((x, y) => [x, to.y()]);
        } else {
          steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
          steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLane(
              to,
              Frame.cumWidths[Frame.lastXCoordBelow(to.x()) + 1]
            ).getPosition(to),
            y
          ]);
          steps.push((x, y) => [x, to.y()]);
          steps.push((x, y) => [to.centerX + Config.FnRadius * 2, y]);
        }
      }
    } else {
      if (to.x() < from.x()) {
        // move to the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() - Config.TextMargin]);

        // vertical lane, horizontal lane, vertical lane,
        steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            to,
            Frame.cumWidths[Frame.lastXCoordBelow(to.x()) + 1]
          ).getPosition(to),
          y
        ]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x(), y]);
      } else {
        steps.push((x, y) => [ArrowLane.getVerticalLane(to, x).getPosition(to), y]);
        steps.push((x, y) => [x, ArrowLane.getHorizontalLane(to, y).getPosition(to)]);
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            to,
            Frame.cumWidths[Frame.lastXCoordBelow(to.x()) + 1]
          ).getPosition(to),
          y
        ]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [to.x(), y]);
      }
    }
    return steps;
  }
}
