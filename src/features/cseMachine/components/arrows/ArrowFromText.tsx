import { Config } from '../../CseMachineConfig';
import type { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { ContValue } from '../values/ContValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow<Text, Value> {
  constructor(
    from: Text,
    private readonly sourceFrame: Pick<Frame, 'x' | 'y' | 'width' | 'height'>,
  ) {
    super(from);
    this.isLive = from.options.faded === undefined ? true : !from.options.faded; // Text items are always live
  }

  protected updateIsLive(): void {
    this.isLive = this.source.options.faded === undefined ? true : !this.source.options.faded;
  }

  protected getOriginFilterKey() {
    return 'text' as const;
  }

  protected getSourceFrameBounds() {
    return {
      x: this.sourceFrame.x(),
      y: this.sourceFrame.y(),
      width: this.sourceFrame.width(),
      height: this.sourceFrame.height(),
    };
  }

  /**
   * Only render the initial in-frame prefix above the source frame.
   * Once the arrow exits the frame for the first time, the rest should stay under frames.
   */
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

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const verticalTerminalOffset = Math.max(Config.DataUnitHeight / 3, terminalSegmentLength);
    const postFrameStraightLength = Config.ArrowPostFrameStraightLength;

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    // If the text has a parent frame, extend straight out until exiting the frame
    const textRightEdge = from.x() + from.width();
    const frameExitX = from.options.parentFrame
      ? from.options.parentFrame.x() + from.options.parentFrame.width() + postFrameStraightLength
      : textRightEdge + postFrameStraightLength;

    // Extend straight from text to frame boundary
    if (frameExitX > textRightEdge) {
      steps.push((x, y) => [frameExitX, y]);
    }

    const isFnTarget =
      to instanceof FnValue || to instanceof GlobalFnValue || to instanceof ContValue;

    // Closure geometry: targetCX = left eyeball center (Fn) or circle center (Cont).
    // leftFaceX = leftmost point; rightFaceX = rightmost point of the closure shape.
    const r = isFnTarget ? to.radius : 0;
    const targetCX = isFnTarget
      ? to instanceof ContValue
        ? to.centerX
        : to.centerX - to.radius
      : 0;
    const targetCY = isFnTarget ? to.y() : 0; // circle center Y
    // FnValue right face = centerX + 2r; ContValue right face = centerX + r.
    const leftFaceX = targetCX - r;
    const rightFaceX = to instanceof ContValue ? targetCX + r : targetCX + 3 * r;

    if (to.x() < from.x()) {
      // Target is to the left - bend left and down/up to reach target
      if (to instanceof ArrayValue) {
        steps.push((x, y) => [x, to.y() - verticalTerminalOffset]);
        steps.push((x, y) => [to.x() + Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y()]);
      } else if (isFnTarget) {
        // Approach from the right: bend up first, then left, landing on the right face.
        steps.push((x, y) => [x, y - from.height() / 2 - Config.TextMargin]);
        steps.push((x, y) => [rightFaceX + terminalSegmentLength, y]);
        steps.push((x, y) => [x, targetCY]);
        steps.push((x, y) => [rightFaceX, y]);
      } else {
        steps.push((x, y) => [x, y - from.height() / 2 - Config.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + terminalSegmentLength, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - terminalSegmentLength, y]);
      }
    } else {
      const targetY = to instanceof ArrayValue ? to.y() + Config.DataUnitHeight / 2 : to.y();
      const preTerminalX =
        frameExitX > to.x()
          ? Math.max(frameExitX, rightFaceX + terminalSegmentLength)
          : Math.max(frameExitX, leftFaceX - terminalSegmentLength);

      if (isFnTarget) {
        // Use the approach Y (horizontal segment Y) to decide which face of the circle to land on.
        // Same level → left face; source above → top face; source below → bottom face.
        const approachY = from.y() + from.height() / 2;
        const [landX, landY] = ((): [number, number] => {
          if (approachY < targetCY - r) return [targetCX, targetCY - r]; // from above: top face
          if (approachY > targetCY + r) return [targetCX, targetCY + r]; // from below: bottom face
          return [leftFaceX, targetCY]; // same level: left face
        })();
        steps.push((x, y) => [landX, y]);
        steps.push(() => [landX, landY]);
      } else {
        // If preTerminalX overshoots past the target's left edge (e.g. because frameExitX is wide),
        // the arrow approaches from the right — land on the right edge instead of the left edge.
        const terminalTargetX = preTerminalX > to.x() ? to.x() + to.width() : to.x();

        // Route text-to-array arrows with Manhattan segments, ending at array's left-center.
        steps.push((x, y) => [preTerminalX, y]);
        steps.push((x, y) => [x, targetY]);
        steps.push((x, y) => [terminalTargetX, y]);
      }
    }

    return steps;
  }
}
