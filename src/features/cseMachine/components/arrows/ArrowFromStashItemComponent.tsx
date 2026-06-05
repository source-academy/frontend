import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { Config } from '../../CseMachineConfig';
import type { StepsArray } from '../../CseMachineTypes';
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

    const steps: StepsArray = [
      (x, y) => [x + from.width() / 2, y + from.height()],
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue || to instanceof ContValue) {
      const sourceBottomY = from.y() + from.height();
      // For FnValue/GlobalFnValue target the left eyeball center; for ContValue the single circle.
      const targetCX = to instanceof ContValue ? to.centerX : to.centerX - to.radius;
      const targetCY = to.y(); // circle center Y
      const r = to.radius;

      const getLanding = (approachY: number): [number, number] => {
        if (approachY > targetCY + r) return [targetCX, targetCY + r]; // from below
        if (approachY < targetCY - r) return [targetCX, targetCY - r]; // from above
        return [targetCX - r, targetCY]; // same level: left face
      };

      const approachY =
        targetCY >= sourceBottomY
          ? Math.max(sourceBottomY + postSourceStraightLength, targetCY - terminalSegmentLength)
          : Math.max(sourceBottomY + postSourceStraightLength, targetCY + terminalSegmentLength);

      const [landX, landY] = getLanding(approachY);
      steps.push((_x, _y) => [_x, approachY]);
      steps.push((_x, _y) => [landX, _y]);
      steps.push(() => [landX, landY]);
    } else {
      const targetX = to.x() + (to.x() < from.x() + from.width() / 2 ? to.width() / 2 : 0);
      const turnY =
        to.y() >= from.y() + from.height()
          ? Math.max(
              from.y() + from.height() + postSourceStraightLength,
              to.y() - terminalSegmentLength,
            )
          : Math.max(
              from.y() + from.height() + postSourceStraightLength,
              to.y() + terminalSegmentLength,
            );

      steps.push((x, y) => [x, turnY]);
      steps.push(() => [targetX, turnY]);
      steps.push((x, y) => [x, to.y()]);
    }

    return steps;
  }
}
