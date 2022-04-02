import { Config } from '../../EnvVisualizerConfig';
import { StepsArray, Visible } from '../../EnvVisualizerTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Arrow } from './Arrow';
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
      if (Math.abs(target.y() - source.y()) < Config.DataUnitHeight) {
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
        const yOffset =
          (source.y() < target.y()
            ? -0.5
            : source.y() > target.y()
            ? 0.5
            : source.x() <= target.x()
            ? -0.5
            : 0.5) * Config.DataUnitHeight;
        if (source.x() > target.x() + target.units.length * Config.DataUnitWidth) {
          steps.push((x, y) => [
            target.x() +
              Math.max(Config.DataMinWidth, target.units.length * Config.DataUnitWidth) +
              Config.DataMinWidth,
            target.y() + Config.DataUnitHeight / 2 + yOffset
          ]);
          steps.push((x, y) => [x - Config.DataMinWidth, y - yOffset]);
        } else if (source.x() < target.x()) {
          steps.push((x, y) => [
            target.x() - Config.DataMinWidth,
            target.y() + Config.DataUnitHeight / 2 + yOffset
          ]);
          steps.push((x, y) => [x + Config.DataMinWidth, y - yOffset]);
        } else {
          steps.push((x, y) => {
            const index = Math.floor((source.x() - target.x()) / Config.DataUnitWidth);
            if (
              target.units.length >= index &&
              target.units[index] &&
              target.units[index].arrow !== undefined
            ) {
              const targetUnitArrow = ((target.units[index].arrow as Arrow).path() ?? '').split(
                ' '
              );
              // check if arrow will overlap with arrow pointing out of array.
              const arrowClash =
                targetUnitArrow.length > 9 &&
                targetUnitArrow[7] === targetUnitArrow[4] &&
                targetUnitArrow[8] < targetUnitArrow[5];
              return [
                target.x() +
                  Config.DataUnitWidth * index +
                  (arrowClash ? 0 : Config.DataUnitWidth / 2),
                target.y() + Config.DataUnitHeight / 2 + yOffset
              ];
            } else {
              return [
                target.x() + Config.DataUnitWidth * index + Config.DataUnitWidth / 2,
                target.y() + Config.DataUnitHeight / 2 + yOffset
              ];
            }
          });
        }
      }
    } else {
      // this shouldn't happen.
      steps.push((x, y) => [target.x(), target.y()]);
    }
    return steps;
  }
}
