import { Config } from '../../CseMachineConfig';
import type { StepsArray } from '../../CseMachineTypes';
import { ArrayUnit } from '../ArrayUnit';
import { ArrayValue } from '../values/ArrayValue';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow<ArrayUnit, Value> {
  constructor(from: ArrayUnit) {
    super(from);
    this.isLive = from.parent.isEnclosingFrameLive();
  }

  protected updateIsLive(): void {
    this.isLive = this.source.parent.isEnclosingFrameLive();
  }

  protected getOriginFilterKey() {
    return 'array' as const;
  }

  protected getSourceFrameBounds() {
    return {
      x: this.source.x(),
      y: this.source.y(),
      width: this.source.width(),
      height: this.source.height(),
    };
  }

  protected getSourceFrameSegmentPath(): string {
    const rect = this.getSourceFrameBounds();
    if (!rect) {
      return '';
    }
    return this.getPathPrefixUntilFirstBoundaryExit(rect);
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + Config.DataUnitWidth / 2, y + Config.DataUnitHeight / 2],
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue || to instanceof ContValue) {
      const sourceCenterX = from.x() + Config.DataUnitWidth / 2;
      const sourceCenterY = from.y() + Config.DataUnitHeight / 2;
      // For Fn/GlobalFn: target the left eyeball. For Cont: target the single circle.
      const targetCX = to instanceof ContValue ? to.centerX : to.centerX - to.radius;
      const targetCY = to.y(); // circle center Y
      const r = to.radius;

      if (sourceCenterX <= to.x()) {
        // Which face of the left circle to land on, based on where the horizontal
        // segment sits relative to the circle center (using r as the threshold).
        const getLanding = (approachY: number): [number, number] => {
          if (approachY > targetCY + r) return [targetCX, targetCY + r]; // from below
          if (approachY < targetCY - r) return [targetCX, targetCY - r]; // from above
          return [targetCX - r, targetCY]; // same level: left face
        };

        if (from.isLastUnit) {
          // Last unit: can exit right. Horizontal to landing X, then vertical to landing Y.
          const [landX, landY] = getLanding(sourceCenterY);
          steps.push((_x, _y) => [landX, _y]);
          steps.push(() => [landX, landY]);
        } else {
          // Non-last unit: cannot exit right. Exit top/bottom, then horizontal, then land.
          const clearance = Config.DataUnitHeight * 0.25;
          const exitY =
            targetCY < sourceCenterY
              ? from.y() - clearance
              : from.y() + Config.DataUnitHeight + clearance;
          const [landX, landY] = getLanding(exitY);
          steps.push((_x, _y) => [_x, exitY]);
          steps.push((_x, _y) => [landX, _y]);
          steps.push(() => [landX, landY]);
        }
      } else if (sourceCenterX >= to.x() + to.width()) {
        // From right: bypass above/below, land on top/bottom of target circle
        const landY = sourceCenterY <= targetCY ? targetCY - 2*r : targetCY + 2*r;
        steps.push((_x, _y) => [_x, landY]);
        steps.push((x, _y) => [targetCX, _y]);
        steps.push(() => [targetCX, landY + r * (sourceCenterY <= targetCY ? 1 : -1)]);
      } else {
        // From top/bottom: go to target circle center X, touch top/bottom boundary
        const landY = sourceCenterY <= targetCY ? targetCY - 2*r : targetCY + 2*r;
        steps.push((_x, y) => [_x, landY]);
        steps.push((x, _y) => [targetCX, _y]);
        steps.push(() => [targetCX, landY + r * (sourceCenterY <= targetCY ? 1 : -1)]);
      }
    } else if (to instanceof ArrayValue) {
      if (from.y() === to.y()) {
        if (from.isLastUnit && to.x() > from.x() && to.x() <= from.x() + Config.DataUnitWidth * 2) {
          // Horizontal arrow that follows box-and-pointer notation for lists
          steps.push(() => [to.x(), to.y() + Config.DataUnitHeight / 2]);
        } else if (Math.abs(from.x() - to.x()) < Config.DataUnitWidth / 2) {
          // Longer circular arrow for arrows pointing back to the same spot
          steps.push((x, y) => [x, y - Config.DataUnitHeight]);
          steps.push(() => [to.x() - Config.DataUnitWidth / 2, to.y() - Config.DataUnitHeight / 2]);
          steps.push((x, y) => [x, y + (Config.DataUnitHeight * 2) / 3]);
          steps.push((x, y) => [x + Config.DataUnitWidth / 2, y]);
        } else {
          // Standard arrow that curves upwards first before pointing to the target
          steps.push((x, y) => [x, y - Config.DataUnitHeight]);
          steps.push(() => [to.x() + Config.DataUnitWidth / 2, to.y() - Config.DataUnitHeight / 2]);
          steps.push((x, y) => [x, y + Config.DataUnitHeight / 2]);
        }
      } else {
        // Manhattan routing: exit source from the correct edge, travel horizontal, enter target
        const targetX = to.x() + Config.DataUnitWidth / 2;
        const clearance = Config.DataUnitHeight * 0.25;
        if (to.y() > from.y()) {
          // Target is below: exit just past source bottom, travel right/left, enter target top
          steps.push((_x, _y) => [_x, from.y() + Config.DataUnitHeight + clearance]);
          steps.push((_x, _y) => [targetX, _y]);
          steps.push(() => [targetX, to.y()]);
        } else {
          // Target is above: exit just past source top, travel right/left, enter target bottom
          steps.push((_x, _y) => [_x, from.y() - clearance]);
          steps.push((_x, _y) => [targetX, _y]);
          steps.push(() => [targetX, to.y() + Config.DataUnitHeight]);
        }
      }
    }

    return steps;
  }
}
