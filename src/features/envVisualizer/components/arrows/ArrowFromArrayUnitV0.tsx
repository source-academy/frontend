import { Config } from '../../EnvVisualizerConfig';
import { StepsArray, Visible } from '../../EnvVisualizerTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrowLane } from '../ArrowLane';
import { Frame } from '../Frame';
import { Grid } from '../Grid';
// import { Grid } from '../Grid';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow {
  private static emergeFromTopOrBottom(steps: StepsArray, from: ArrayUnit, to: Visible) {
    // Move up if target above source or to the right with same vertical position.
    // Moves up slightly more if target is to the right.
    const offset = to.y() / (to.x() + 1) + to.x() / (to.y() + 1);
    steps.push((x, y) => [
      x,
      y +
        (to.y() > from.y() || (to.y() === from.y() && to.x() <= from.x()) ? 1 : -1) *
          (Config.DataUnitHeight - 2 * offset) -
        (Math.sign(to.x() - from.x()) * Config.DataUnitHeight) / 12
    ]);
  }
  protected calculateSteps() {
    const from = this.from as ArrayUnit;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + Config.DataUnitWidth / 2, y + Config.DataUnitHeight / 2]
    ];
    const offset = to.y() / (to.x() + 1) + to.x() / (to.y() + 1);
    if (to instanceof FnValue || to instanceof GlobalFnValue) {
      ArrowFromArrayUnit.emergeFromTopOrBottom(steps, from, to);
      steps.push((x, y) => [
        ArrowLane.getVerticalLane(
          to,
          Frame.cumWidths[Frame.lastXCoordBelow(x) + (to.x() < x ? 0 : 1)]
        ).getPosition(to),
        y
      ]);
      steps.push((x, y) => [
        x,
        ArrowLane.getHorizontalLane(
          to,
          Grid.cumHeights[Grid.lastYCoordBelow(to.y()) - 1]
        ).getPosition(to)
      ]);
      steps.push((x, y) => [
        ArrowLane.getVerticalLane(
          to,
          Frame.cumWidths[Frame.lastXCoordBelow(to.x()) + 1]
        ).getPosition(to),
        y
      ]);
      steps.push((x, y) => [x, to.y()]);
      steps.push((x, y) => [to.centerX + Config.FnRadius * 2, y]);
    } else if (to instanceof ArrayValue) {
      if ((to as ArrayValue).level !== from.parent.level) {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, from, to);
        // Frame avoidance
        steps.push((x, y) => [
          ArrowLane.getVerticalLane(
            to,
            Frame.cumWidths[Frame.lastXCoordBelow(x) + (to.x() < x ? 0 : 1)]
          ).getPosition(to),
          y
        ]);
        if (from.x() > to.x() + to.width()) {
          // moves left horzontally 1/3 of array height below/above other arrays
          steps.push((x, y) => [
            x,
            to.y() +
              (1 / 2 - (4 / 6) * Math.sign(to.y() - from.y())) *
                (Config.DataUnitHeight + 3 * offset)
          ]);
          // point to right of array
          steps.push((x, y) => [
            to.x() +
              Math.max(Config.DataMinWidth, to.units.length * Config.DataUnitWidth) +
              Config.DataUnitWidth / 2,
            y
          ]);
          steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
          steps.push((x, y) => [
            to.x() + Math.max(Config.DataMinWidth, to.units.length * Config.DataUnitWidth),
            y
          ]);
        } else {
          // moves right horzontally 1/3 of array height below/above other arrays
          steps.push((x, y) => [
            x,
            to.y() +
              (1 / 2 - (5 / 6) * Math.sign(to.y() - from.y())) *
                (Config.DataUnitHeight + 3 * offset)
          ]);
          // point to left of array
          steps.push((x, y) => [to.x() - Config.DataUnitWidth / 2, y]);
          steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
          steps.push((x, y) => [to.x(), y]);
        }
      } else {
        if (from.y() === to.y()) {
          // same vertical position
          if (from.parent === to) {
            steps.push((x, y) => [x, y - (Config.DataUnitHeight * 3) / 4]);
            steps.push((x, y) => [x + Config.DataUnitHeight / 3, y]);
            steps.push((x, y) => [x, y + Config.DataUnitHeight / 4]);
          } else {
            ArrowFromArrayUnit.emergeFromTopOrBottom(steps, from, to);
            if (from.x() > to.x() + to.units.length * Config.DataUnitWidth) {
              steps.push((x, y) => [
                to.x() + to.units.length * Config.DataUnitWidth + Config.DataUnitWidth / 2,
                y
              ]);
              steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
              steps.push((x, y) => [x - Config.DataUnitWidth / 2, y]);
            } else {
              steps.push((x, y) => [to.x() - Config.DataUnitWidth / 2, y]);
              steps.push((x, y) => [x, to.y() + Config.DataUnitHeight / 2]);
              steps.push((x, y) => [x + Config.DataUnitWidth / 2, y]);
            }
          }
        } else {
          // same array level but different y position, draw straight arrows.
          steps.push((x, y) => [
            from.x() <= to.x()
              ? to.x() + Config.DataUnitWidth / 3
              : from.x() > to.x() + to.units.length * Config.DataUnitWidth
              ? to.x() + Math.max(to.units.length, 1 / 3) * Config.DataUnitWidth
              : to.x() + Config.DataUnitWidth / 2,
            to.y() + (from.y() > to.y() ? Config.DataUnitHeight : 0)
          ]);
        }
      }
    } else {
      // this shouldn't happen.
      steps.push((x, y) => [to.x(), to.y()]);
    }
    return steps;
  }
}
