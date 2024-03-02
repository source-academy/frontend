import { Config } from '../../CseMachineConfig';
import { IVisible, StepsArray } from '../../CseMachineTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrowLane } from '../ArrowLane';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow<ArrayUnit, Value> {
  private static emergeFromTopOrBottom(steps: StepsArray, from: ArrayUnit, to: IVisible) {
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

        steps.push(() => [target.centerX + Config.FnRadius * 2 + Config.FnRadius, target.y()]);
        steps.push((x, y) => [x - Config.FnRadius, y]);
      } else {
        steps.push(() => [target.centerX + Config.FnRadius * 2, target.y()]);
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
        // pointing to next element in list.
        steps.push(() => [target.x(), target.y() + Config.DataUnitHeight / 2]);
      } else {
        ArrowFromArrayUnit.emergeFromTopOrBottom(steps, source, target);

        const potentialVerticalLaneX = ArrowLane.getVerticalLaneAfterSource(
          target,
          source.x()
        ).getPosition(target);
        // move to vertical lane only if lane exists between source and target
        if ((potentialVerticalLaneX - source.x()) * (potentialVerticalLaneX - target.x()) < 0) {
          steps.push((x, y) => [potentialVerticalLaneX, y]);
        }
        // move to horizontal lane only if lane exists between source and target
        const potentialHorizontalLaneY = ArrowLane.getHorizontalLaneBeforeTarget(
          target,
          source.y()
        ).getPosition(target);
        if ((potentialHorizontalLaneY - source.y()) * (potentialHorizontalLaneY - target.y()) < 0) {
          steps.push((x, y) => {
            return (potentialHorizontalLaneY - y) * (potentialHorizontalLaneY - target.y()) > 0
              ? [x, y]
              : [x, ArrowLane.getHorizontalLaneBeforeTarget(target, y).getPosition(target)];
          });
        }

        // Move to x position closer to array on horizontal lane
        steps.push((x, y) => {
          let newX: number;
          let yDiff = target.y() + Config.DataUnitHeight / 2 - y;
          const newY =
            target.y() + Config.DataUnitHeight / 2 - (Math.sign(yDiff) * Config.DataUnitHeight) / 2;
          yDiff = newY - y;
          if (x < target.x() - Config.DataUnitWidth) {
            // move right up to the point diagonally to the left of the start of the array.
            newX = Math.max(x + Config.DataUnitWidth, target.x() - Math.abs(yDiff));
          } else if (
            x >=
            target.x() + target.units.length * Config.DataUnitWidth + Config.DataUnitWidth
          ) {
            // move left up to the point diagonally to the right of the end of the array.
            newX = target.x() + target.units.length * Config.DataUnitWidth;
            newX = Math.min(x - Config.DataUnitWidth, newX + Math.abs(yDiff));
          } else {
            // if current point of arrow is somewhere above / below array, move halfway to corner of some arrayunit.
            if (x < target.x()) {
              newX = target.x();
            } else if (
              x >=
              target.x() + target.units.length * Config.DataUnitWidth + Config.DataUnitWidth
            ) {
              newX = target.x() + target.units.length * Config.DataUnitWidth + Config.DataUnitWidth;
            } else {
              const index = Math.floor((x - target.x()) / Config.DataUnitWidth);
              newX = target.x() + Config.DataUnitWidth * index;
            }
            return [(x + newX) / 2, (y + newY) / 2];
          }
          return [newX, y];
        });
        // Move to corner of some arrayunit.
        steps.push((x, y) => {
          const index = Math.floor((x - target.x()) / Config.DataUnitWidth);
          const yDiff = target.y() + Config.DataUnitHeight / 2 - y;
          const newY =
            target.y() + Config.DataUnitHeight / 2 - (Math.sign(yDiff) * Config.DataUnitHeight) / 2;
          if (x < target.x()) {
            return [target.x(), newY];
          } else if (x >= target.x() + target.units.length * Config.DataUnitWidth) {
            return [target.x() + target.units.length * Config.DataUnitWidth, newY];
          } else {
            return [target.x() + Config.DataUnitWidth * index, newY];
          }
        });
      }
    } else {
      // this shouldn't happen.
      steps.push(() => [target.x(), target.y()]);
    }
    return steps;
  }
}
