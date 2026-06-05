import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { Config } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import type { StepsArray } from '../../CseMachineTypes';
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

    const postSourceStraightLength = Config.ArrowPostFrameStraightLength;

    const steps: StepsArray = [
      (x, y) => [x + from.width(), y + from.height() / 2],
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue || to instanceof ContValue) {
      const sourceRightX = from.x() + from.width();
      // For FnValue/GlobalFnValue target the left eyeball center; for ContValue the single circle.
      const targetCX = to instanceof ContValue ? to.centerX : to.centerX - to.radius;
      const targetCY = to.y(); // circle center Y
      const r = to.radius;
      // FnValue right face = centerX + 2r; ContValue right face = centerX + r.
      const leftFaceX = targetCX - r;
      const rightFaceX = to instanceof ContValue ? targetCX + r : targetCX + 3 * r;

      // Horizontal final approach: determine which face to land on based on approach X.
      const getLandingH = (approachX: number): [number, number] => {
        if (approachX > rightFaceX) return [rightFaceX, targetCY]; // from right: right face
        if (approachX < leftFaceX) return [leftFaceX, targetCY]; // from left: left face
        return [targetCX, targetCY - r]; // within shape bounds: top face
      };

      // Bend just after leaving the source — short horizontal stub, then turn toward target.
      const turnX = sourceRightX + postSourceStraightLength;

      const [landX, landY] = getLandingH(turnX);
      steps.push((_x, _y) => [turnX, _y]);
      steps.push((_x, _y) => [_x, landY]);
      steps.push(() => [landX, landY]);
    } else {
      // Frame: bend just after leaving the source, then go straight to the frame's left edge.
      const targetY =
        to.y() +
        (to.x() > ControlStashConfig.ControlItemWidth + 100
          ? ControlStashConfig.ControlItemTextPadding
          : 0);
      const turnX = from.x() + from.width() + postSourceStraightLength;

      steps.push((x, y) => [turnX, y]);
      steps.push((x, y) => [x, targetY]);
      steps.push(() => [to.x(), targetY]);
    }

    return steps;
  }
}
