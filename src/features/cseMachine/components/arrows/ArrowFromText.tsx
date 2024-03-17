import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { Grid } from '../Grid';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromText<V extends Value> extends GenericArrow<Text, V> {
  protected calculateSteps() {
    const source = this.source;
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [(x, y) => [x + source.width(), y + source.height() / 2]];
    if (target instanceof ArrayValue) {
      steps.push((x, y) => [x + Config.TextMargin + Config.TextPaddingX, y]); // Spacing to right of text in frame
      steps.push((x, y) => {
        const newX = ArrowLane.getVerticalLaneAfterSource(target, x).getPosition(target);
        return newX < x
          ? [x, y - Math.sign(source.y() - target.y()) * (source.height() + Config.TextMargin)]
          : [x, y];
      }); // if the potential vertical lane is to the left, loop above or below text to allow GenericArrow to move left.
      steps.push((x, y) => [
        ArrowLane.getVerticalLaneAfterSource(target, x).getPosition(target),
        y
      ]);
      // move to horizontal lane only if lane exists between source and target
      const potentialHorizontalLaneY = ArrowLane.getHorizontalLaneBeforeTarget(
        target,
        source.y()
      ).getPosition(target);
      if ((potentialHorizontalLaneY - source.y()) * (potentialHorizontalLaneY - target.y()) < 0) {
        steps.push((x, y) => {
          const newY = ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target);
          return (newY - y) * (newY - target.y()) > 0
            ? [x, y]
            : [x, ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)];
        });
      }

      // Move to x position closer to array on horizontal lane
      steps.push((x, y) => {
        let newX: number;
        let yDiff = target.y() + Config.DataUnitHeight / 2 - y;
        yDiff = Math.abs(yDiff - (Math.sign(yDiff) * Config.DataUnitHeight) / 2);
        if (x < target.x()) {
          newX = Math.max(x + Config.DataUnitWidth, target.x() - yDiff);
        } else if (x >= target.x() + target.units.length * Config.DataUnitWidth) {
          newX = target.x() + target.units.length * Config.DataUnitWidth;
          newX = Math.min(x - Config.DataUnitWidth, newX + yDiff);
        } else {
          // if current point of arrow is somewhere above / below array, move halfway to corner of some arrayunit.
          const index = Math.floor((x - target.x()) / Config.DataUnitWidth);
          newX = target.x() + Config.DataUnitWidth * index;
          return [(x + newX) / 2, (y + target.y()) / 2];
        }
        return [newX, y];
      });
      // Move to array pointing to corner of some arrayunit
      steps.push((x, y) => {
        const index = Math.floor((x - target.x()) / Config.DataUnitWidth);
        const yDiff = source.y() - (target.y() + Config.DataUnitHeight / 2);
        const newY =
          target.y() +
          Config.DataUnitHeight / 2 +
          ((Math.abs(yDiff) < Config.DataUnitHeight ? 0 : Math.sign(yDiff)) *
            Config.DataUnitHeight) /
            2;
        if (x < target.x()) {
          return [target.x(), newY];
        } else if (x >= target.x() + target.units.length * Config.DataUnitWidth) {
          return [target.x() + target.units.length * Config.DataUnitWidth, newY];
        } else {
          return [target.x() + Config.DataUnitWidth * index, newY];
        }
      });
    } else if (target instanceof FnValue || target instanceof GlobalFnValue) {
      if (target.x() < source.x()) {
        // move target the left of current frame above the binding.
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - Math.sign(source.y() - target.y()) * source.height()]);
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
          steps.push((x, y) => [
            ArrowLane.getVerticalLaneAfterSource(target, x).getPosition(target),
            y
          ]);
          steps.push((x, y) => [
            x,
            ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
          ]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLaneBeforeTarget(target, x).getPosition(target),
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
          steps.push((x, y) => [
            ArrowLane.getVerticalLaneAfterSource(target, x).getPosition(target),
            y
          ]);
          steps.push((x, y) => [
            x,
            ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)
          ]);
          steps.push((x, y) => [
            ArrowLane.getVerticalLaneBeforeTarget(target, x).getPosition(target),
            y
          ]);
          steps.push((x, y) => [x, target.y()]);
          steps.push((x, y) => [target.centerX + Config.FnRadius * 2, y]);
        }
      }
    } else {
      steps.push((x, y) => [x, target.y()]);
      steps.push((x, y) => [target.x(), y]);
    }
    return steps;
  }
}
