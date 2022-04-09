import { Config } from '../../EnvVisualizerConfig';
import { StepsArray, Visible } from '../../EnvVisualizerTypes';
import { ArrayUnit } from '../ArrayUnit';
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
        (to.y() > from.y() || (to.y() === from.y() && to.x() <= from.x()) ? 0.9 : -0.9) *
          Config.DataUnitHeight
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
      if (Math.abs(target.y() - source.y()) < Config.DataUnitHeight * 2) {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);
        steps.push((x, y) => [target.centerX + Config.FnRadius * 2 + Config.FnRadius, target.y()]);
        steps.push((x, y) => [x - Config.FnRadius, y]);
      } else {
        steps.push((x, y) => [target.centerX + Config.FnRadius * 2, target.y()]);
      }
    } else if (target instanceof ArrayValue) {
      if (source.parent === target) {
        steps.push((x, y) => [x, y - (Config.DataUnitHeight * 3) / 4]);
        steps.push((x, y) => [x + Config.DataUnitHeight / 3, y]);
        steps.push((x, y) => [x, y + Config.DataUnitHeight / 4]);
      } else if (
        source.isLastUnit &&
        target.x() - source.x() <= Config.DataUnitWidth * 3 &&
        target.x() > source.x() &&
        target.level === source.parent.level
      ) {
        steps.push((x, y) => [target.x(), target.y() + Config.DataUnitHeight / 2]);
      } else {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);

        steps.push((x, y) => {
          const index = Math.floor((x - target.x()) / Config.DataUnitWidth);
          const newY = target.y() + (y <= target.y() ? 0 : 1) * Config.DataUnitHeight;
          if (x < target.x()) {
            return [target.x(), newY];
          } else if (x >= target.x() + target.units.length * Config.DataUnitWidth) {
            return [
              target.x() +
                target.units.length * Config.DataUnitWidth +
                (target.units.length === 0 ? Config.DataMinWidth : 0),
              newY
            ];
          } else {
            return [
              target.x() +
                Config.DataUnitWidth * index +
                (Math.abs(source.y() - target.y()) <= Config.DataUnitHeight * 3
                  ? Config.DataUnitWidth / 2
                  : 0),
              newY
            ];
          }
        });
      }
    } else {
      // this shouldn't happen.
      steps.push((x, y) => [target.x(), target.y()]);
    }
    return steps;
  }
}
