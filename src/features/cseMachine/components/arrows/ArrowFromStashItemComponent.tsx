import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { StashItemComponent } from '../StashItemComponent';
import { ArrayValue } from '../values/ArrayValue';
import { ContValue } from '../values/ContValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStashItemComponent extends GenericArrow<
  StashItemComponent,
  Frame | FnValue | GlobalFnValue | ArrayValue | ContValue
> {
  constructor(from: StashItemComponent) {
    super(from);
    this.isLive = true; // Stash items are always live
  }

  protected getOriginFilterKey() {
    return 'stash' as const;
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const postSourceStraightLength = Config.ArrowPostFrameStraightLength;
    const targetX = to.x() + (to.x() < from.x() + from.width() / 2 ? to.width() / 2 : 0);
    const turnY =
      to.y() >= from.y() + from.height()
        ? Math.max(
            from.y() + from.height() + postSourceStraightLength,
            to.y() - terminalSegmentLength
          )
        : Math.max(
            from.y() + from.height() + postSourceStraightLength,
            to.y() + terminalSegmentLength
          );

    const steps: StepsArray = [
      (x, y) => [x + from.width() / 2, y + from.height()],
      (x, y) => [x, turnY],
      () => [targetX, turnY],
      (x, y) => [x, to.y()]
    ];

    return steps;
  }
}
