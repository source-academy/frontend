import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow<Text, Value> {
  constructor(from: Text) {
    super(from);
    this.isLive = from.options.faded === undefined ? true : !from.options.faded; // Text items are always live
  }

  protected updateIsLive(): void {
    this.isLive = this.source.options.faded === undefined ? true : !this.source.options.faded;
  }

  protected getOriginFilterKey() {
    return 'text' as const;
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const initialSegmentLength = Math.max(Config.TextMargin, Config.MinTerminalSegmentLength);
    const verticalTerminalOffset = Math.max(Config.DataUnitHeight / 3, terminalSegmentLength);
    const postFrameStraightLength = Config.ArrowPostFrameStraightLength;

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    // If the text has a parent frame, extend straight out until exiting the frame
    const textRightEdge = from.x() + from.width();
    const frameExitX = from.options.parentFrame
      ? from.options.parentFrame.x() + from.options.parentFrame.width() + postFrameStraightLength
      : textRightEdge + initialSegmentLength + postFrameStraightLength;

    // Extend straight from text to frame boundary
    if (frameExitX > textRightEdge) {
      steps.push((x, y) => [frameExitX, y]);
    }

    if (to.x() < from.x()) {
      // Target is to the left - bend left and down/up to reach target
      if (to instanceof ArrayValue) {
        steps.push((x, y) => [x, to.y() - verticalTerminalOffset]);
        steps.push((x, y) => [to.x() + Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y()]);
      } else {
        steps.push((x, y) => [x, y - from.height() / 2 - Config.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + terminalSegmentLength, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - terminalSegmentLength, y]);
      }
    } else {
      if (to instanceof ArrayValue) {
        // Route text-to-array arrows with Manhattan segments, ending at array's left-center.
        const arrayMidY = to.y() + Config.DataUnitHeight / 2;
        const preTerminalX = Math.max(frameExitX, to.x() - terminalSegmentLength);
        steps.push((x, y) => [preTerminalX, y]);
        steps.push((x, y) => [x, arrayMidY]);
        steps.push((x, y) => [to.x(), y]);
      } else {
        // Target is to the right - non-array values can go directly to target
        steps.push((x, y) => [to.x(), to.y()]);
      }
    }

    return steps;
  }
}
