import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import type { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow<Frame, Frame> {
  constructor(from: Frame) {
    super(from);
    this.isLive = from.environment && Layout.liveEnvIDs.has(from.environment.id);
  }

  protected updateIsLive(): void {
    this.isLive = this.source.environment && Layout.liveEnvIDs.has(this.source.environment.id);
  }

  protected getOriginFilterKey() {
    return 'frame' as const;
  }

  protected calculateSteps() {
    const to = this.target;
    if (!to) {
      return [];
    }

    const steps: StepsArray = [(x, y) => [x + Config.FramePaddingX, y]];

    if (to instanceof Frame) {
      // The horizontal part runs across the middle of the space between the frame it starts at and
      // what it passes under in the parent's level (the parent, or a frame beside it that is taller),
      // so that it is as far from the one as from the other (#4512).
      steps.push((x, y) => [x, this.segmentY(to, x, y)]);
      steps.push((x, y) => [to.x() + Config.FramePaddingX, y]);
    }

    steps.push(() => [to.x() + Config.FramePaddingX, to.y() + to.height()]);
    return steps;
  }

  /**
   * The y of the horizontal part of the arrow from the frame whose top is at `top`, up from `x`, to
   * `parent`: halfway between `top` and the lower edge of the lowest frame of the parent's level
   * that the part passes under.
   */
  private segmentY(parent: Frame, x: number, top: number): number {
    const toX = parent.x() + Config.FramePaddingX;
    const [left, right] = x < toX ? [x, toX] : [toX, x];
    let above = parent.y() + parent.height();
    for (const frame of parent.level?.frames ?? []) {
      const passesUnder = frame.x() <= right && left <= frame.x() + frame.totalWidth;
      if (passesUnder) {
        above = Math.max(above, frame.y() + frame.height());
      }
    }
    // (above the frame the arrow starts at in every layout; otherwise as before)
    return above < top ? (above + top) / 2 : top - Config.FrameMarginY;
  }
}
