import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { StepsArray } from '../../CseMachineTypes';
import { ControlItemComponent } from '../ControlItemComponent';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromControlItemComponent extends GenericArrow<
  ControlItemComponent,
  Frame | FnValue | GlobalFnValue
> {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + from.width(), y + from.height() / 2],
      () => [
        to.x(),
        to.y() +
          // Draw arrow slightly below frame corner if frame is far enough
          (to.x() > ControlStashConfig.ControlItemWidth + 100
            ? ControlStashConfig.ControlItemTextPadding
            : 0)
      ]
    ];

    return steps;
  }
}
