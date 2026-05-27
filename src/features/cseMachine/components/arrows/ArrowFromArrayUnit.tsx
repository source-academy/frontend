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
      if (sourceCenterX <= to.x()) {
        // Source is to the left: vertical to circle center y, then horizontal to left edge
        steps.push((_x, y) => [_x, to.y()]);
        steps.push(() => [to.x(), to.y()]);
      } else if (sourceCenterX >= to.x() + to.width()) {
        // Source is to the right: vertical to circle center y, then horizontal to right edge
        steps.push((_x, y) => [_x, to.y()]);
        steps.push(() => [to.x() + to.width(), to.y()]);
      } else {
        // Source is horizontally within the closure shape: approach top or bottom edge vertically
        const landY =
          sourceCenterY <= to.y()
            ? to.y() - Config.FnRadius // from above → top edge of circle
            : to.y() + Config.FnRadius; // from below → bottom edge of circle
        steps.push((_x, _y) => [to.centerX, _y]);
        steps.push(() => [to.centerX, landY]);
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
        // Manhattan-routed arrow: horizontal then vertical
        const targetX = to.x() + Config.DataUnitWidth / 2;
        const targetY = to.y() + (from.y() > to.y() ? Config.DataUnitHeight : 0);
        steps.push((_x, y) => [targetX, y]);
        steps.push(() => [targetX, targetY]);
      }
    }

    return steps;
  }
}
