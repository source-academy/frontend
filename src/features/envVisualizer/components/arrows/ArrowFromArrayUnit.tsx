import { Config } from '../../EnvVisualizerConfig';
import { StepsArray, Visible } from '../../EnvVisualizerTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow {
  private static emergeFromTopOrBottom(steps: StepsArray, from: ArrayUnit, to: Visible) {
    // Move up if target above source or to the right with same vertical position.
    // Moves up slightly more if target is to the right.
    steps.push((x, y) => [
      x,
      y +
        (to.y() > from.y() || (to.y() === from.y() && to.x() <= from.x()) ? 1 : -1) *
          Config.DataUnitHeight -
        (Math.sign(to.x() - from.x()) * Config.DataUnitHeight) / 12
    ]);
  }
  protected calculateSteps() {
    const source = this.source as ArrayUnit;
    const target = this.target;
    if (!target) return [];

    const steps: StepsArray = [
      (x, y) => [x + Config.DataUnitWidth / 2, y + Config.DataUnitHeight / 2]
    ];
    if (target instanceof FnValue || target instanceof GlobalFnValue) {
      if (Math.abs(target.y() - source.y()) < Config.DataUnitHeight) {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);
        steps.push((x, y) => [target.centerX + Config.FnRadius * 2 + Config.FnRadius, y]);
        steps.push((x, y) => [x, target.y()]);
        steps.push((x, y) => [x - Config.FnRadius, y]);
      } else {
        steps.push((x, y) => [target.centerX + Config.FnRadius * 2, target.y()]);
      }
    } else if (target instanceof ArrayValue) {
      if ((target as ArrayValue).level !== source.parent.level) {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);
        // Frame avoidance
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            target,
            Frame.cumWidths[Frame.lastXCoordBelow(x) + (target.x() < x ? 0 : 1)]
          ).getPosition(target),
          y
        ]);
        steps.push((x, y) => [
          x,
          ArrowLane.getHorizontalLane(target, target.y()).getPosition(target)
        ]);
        if (source.x() > target.x() + target.width()) {
          steps.push((x, y) => [
            target.x() +
              Math.max(Config.DataMinWidth, target.units.length * Config.DataUnitWidth) +
              Config.DataMinWidth,
            target.y() + Config.DataUnitHeight / 2
          ]);
          steps.push((x, y) => [x - Config.DataMinWidth, y]);
        } else {
          steps.push((x, y) => [target.x(), target.y() + Config.DataUnitHeight / 2]);
        }
      } else {
        if (source.y() === target.y()) {
          // same vertical position
          if (source.parent === target) {
            steps.push((x, y) => [x, y - (Config.DataUnitHeight * 3) / 4]);
            steps.push((x, y) => [x + Config.DataUnitHeight / 3, y]);
            steps.push((x, y) => [x, y + Config.DataUnitHeight / 4]);
          } else if (
            source.isLastUnit &&
            target.x() - source.x() <= Config.DataUnitWidth * 3 &&
            target.x() > source.x()
          ) {
            steps.push((x, y) => [target.x(), target.y() + Config.DataUnitHeight / 2]);
          } else {
            ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);
            if (source.x() > target.x() + target.units.length * Config.DataUnitWidth) {
              steps.push((x, y) => [
                target.x() +
                  Math.max(Config.DataMinWidth, target.units.length * Config.DataUnitWidth) +
                  Config.DataUnitWidth / 2,
                y
              ]);
              steps.push((x, y) => [x, target.y() + Config.DataUnitHeight / 2]);
              steps.push((x, y) => [x - Config.DataUnitWidth / 2, y]);
            } else {
              steps.push((x, y) => [target.x() - Config.DataUnitWidth / 2, y]);
              steps.push((x, y) => [x, target.y() + Config.DataUnitHeight / 2]);
              steps.push((x, y) => [x + Config.DataUnitWidth / 2, y]);
            }
          }
        } else {
          // same array level but different y position, draw straight arrows.
          steps.push((x, y) => [
            source.x() <= target.x()
              ? target.x() + Config.DataUnitWidth / 3
              : source.x() > target.x() + target.units.length * Config.DataUnitWidth
              ? target.x() + Math.max(target.units.length, 1 / 3) * Config.DataUnitWidth
              : target.x() + Config.DataUnitWidth / 2,
            target.y() + (source.y() > target.y() ? Config.DataUnitHeight : 0)
          ]);
        }
      }
    } else {
      // this shouldn't happen.
      steps.push((x, y) => [target.x(), target.y()]);
    }
    return steps;
  }
}
