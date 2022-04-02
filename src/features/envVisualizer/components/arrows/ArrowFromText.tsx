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
    const source = this.source;
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + source.width(), y + source.height() / 2]];
    if (target instanceof ArrayValue) {
      // Case where there's a single column of frames, so arrays are beside frames.
      const yOffset =
        source.x() < target.x() && target.x() - source.x() < 500
          ? 0
          : (source.y() >= target.y() ? 0.5 : -0.5) * Config.DataUnitHeight;
      if (Frame.maxXCoord <= 0) {
        // steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
        steps.push((x, y) => [
          target.x() - Config.DataMinWidth,
          target.y() + Config.DataUnitHeight / 2 + yOffset
        ]);
        steps.push((x, y) => [x + Config.DataMinWidth, y - yOffset]);
      } else {
        if (source.x() > target.x() + target.units.length * Config.DataUnitWidth) {
          steps.push((x, y) => [x + Config.TextMargin, y]);
          steps.push((x, y) => [x, y - source.height() - Config.TextMargin]);
          steps.push((x, y) => [source.x() - Config.TextMargin - Config.TextPaddingX, y]);
          // steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
          // steps.push((x, y) => [x, ArrowLane.getHorizontalLaneAfterSource(target, y).getPosition(target)]);
          steps.push((x, y) => [
            target.x() +
              Math.max(Config.DataMinWidth, target.units.length * Config.DataUnitWidth) +
              Config.DataMinWidth,
            target.y() + Config.DataUnitHeight / 2 + yOffset
          ]);
          steps.push((x, y) => [x - Config.DataMinWidth, y - yOffset]);
        } else if (source.x() < target.x()) {
          steps.push((x, y) => [x + Config.TextMargin + Config.TextPaddingX, y]);
          // steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
          // steps.push((x, y) => [x, ArrowLane.getHorizontalLaneAfterSource(target, y).getPosition(target)]);
          steps.push((x, y) => [
            target.x() - Config.DataMinWidth,
            target.y() + Config.DataUnitHeight / 2 + yOffset
          ]);
          steps.push((x, y) => [x + Config.DataMinWidth, y - yOffset]);
        } else {
          steps.push((x, y) => [
            target.x() +
              Config.DataUnitWidth * Math.floor((source.x() - target.x()) / Config.DataUnitWidth),
            target.y() + Config.DataUnitHeight / 2 + yOffset
          ]);
        }
      }
    } else if (target instanceof FnValue || target instanceof GlobalFnValue) {
      if (target.x() < source.x()) {
        // move target the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - source.height() - Config.TextMargin]);
        if (
          Grid.lastYCoordBelow(target.y()) === Grid.lastYCoordBelow(source.y()) &&
          Frame.lastXCoordBelow(source.x()) === Frame.lastXCoordBelow(target.x()) + 1
        ) {
          // Move directly target object
          steps.push((x, y) => [target.centerX + Config.FnRadius * 3, y]);
          steps.push((x, y) => [x, target.y()]);
          steps.push((x, y) => [x - Config.FnRadius, y]);
        } else {
          // vertical lane, horizontal lane, vertical lane,
          steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
          steps.push((x, y) => [
            x,
            ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
          ]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLane(
              target,
              Frame.cumWidths[Frame.lastXCoordBelow(target.x()) + 1]
            ).getPosition(target),
            y
          ]);
          steps.push((x, y) => [x, target.y()]);
          steps.push((x, y) => [target.centerX + Config.FnRadius * 2, y]);
        }
      } else {
        if (
          Grid.lastYCoordBelow(target.y()) === Grid.lastYCoordBelow(source.y()) &&
          Frame.lastXCoordBelow(source.x()) === Frame.lastXCoordBelow(target.x())
        ) {
          steps.push((x, y) => [target.x(), y]);
          steps.push((x, y) => [x, target.y()]);
        } else {
          steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
          steps.push((x, y) => [
            x,
            ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
          ]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLane(
              target,
              Frame.cumWidths[Frame.lastXCoordBelow(target.x()) + 1]
            ).getPosition(target),
            y
          ]);
          steps.push((x, y) => [x, target.y()]);
          steps.push((x, y) => [target.centerX + Config.FnRadius * 2, y]);
        }
      }
    } else {
      if (target.x() < source.x()) {
        // move target the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - source.height() - Config.TextMargin]);

        // vertical lane, horizontal lane, vertical lane,
        steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
        steps.push((x, y) => [
          x,
          ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
        ]);
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            target,
            Frame.cumWidths[Frame.lastXCoordBelow(target.x()) + 1]
          ).getPosition(target),
          y
        ]);
        steps.push((x, y) => [x, target.y()]);
        steps.push((x, y) => [target.x(), y]);
      } else {
        steps.push((x, y) => [ArrowLane.getVerticalLane(target, x).getPosition(target), y]);
        steps.push((x, y) => [
          x,
          ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
        ]);
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            target,
            Frame.cumWidths[Frame.lastXCoordBelow(target.x()) + 1]
          ).getPosition(target),
          y
        ]);
        steps.push((x, y) => [x, target.y()]);
        steps.push((x, y) => [target.x(), y]);
      }
    }
    return steps;
  }
}
