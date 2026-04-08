import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { Config } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ControlItemComponent } from '../ControlItemComponent';
import { Frame } from '../Frame';
import { ContValue } from '../values/ContValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromControlItemComponent extends GenericArrow<
  ControlItemComponent,
  Frame | FnValue | GlobalFnValue | ContValue
> {
  constructor(from: ControlItemComponent) {
    super(from);
    this.isLive = true; // Control items are always live
  }

  protected getOriginFilterKey() {
    return 'control' as const;
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const postSourceStraightLength = Config.ArrowPostFrameStraightLength;
    const targetY =
      to.y() +
      // Draw arrow slightly below frame corner if frame is far enough
      (to instanceof Frame && to.x() > ControlStashConfig.ControlItemWidth + 100
        ? ControlStashConfig.ControlItemTextPadding
        : 0);
    const turnX =
      to.x() >= from.x() + from.width()
        ? Math.max(
            from.x() + from.width() + postSourceStraightLength,
            to.x() - terminalSegmentLength
          )
        : Math.min(
            from.x() + from.width() + postSourceStraightLength,
            to.x() + terminalSegmentLength
          );

    const steps: StepsArray = [
      (x, y) => [x + from.width(), y + from.height() / 2],
      (x, y) => [turnX, y],
      (x, y) => [x, targetY],
      () => [to.x(), targetY]
    ];

    return steps;
  }
}
