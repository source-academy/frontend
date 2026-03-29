import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { Value } from '../values/Value';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromText extends GenericArrow<Text, Value> {
  constructor(
    from: Text,
    private readonly sourceFrame: Pick<Frame, 'x' | 'y' | 'width' | 'height'>
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
      height: this.sourceFrame.height()
    };
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const verticalTerminalOffset = Math.max(Config.DataUnitHeight / 3, terminalSegmentLength);

    const steps: StepsArray = [(x, y) => [x + from.width(), y + from.height() / 2]];

    if (to.x() < from.x()) {
      if (to instanceof ArrayValue) {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, to.y() - verticalTerminalOffset]);
        steps.push((x, y) => [to.x() + Config.DataUnitWidth / 2, y]);
        steps.push((x, y) => [x, to.y()]);
      } else {
        steps.push((x, y) => [x + Config.TextMargin, y]);
        steps.push((x, y) => [x, y - from.height() / 2 - Config.TextMargin]);
        steps.push((x, y) => [to.x() + to.width() + terminalSegmentLength, y]);
        steps.push((x, y) => [x, to.y()]);
        steps.push((x, y) => [x - terminalSegmentLength, y]);
      }
    } else {
      steps.push((x, y) => [
        to.x(),
        to.y() + (to instanceof ArrayValue ? Config.DataUnitHeight / 2 : 0)
      ]);
    }

    return steps;
  }
}
