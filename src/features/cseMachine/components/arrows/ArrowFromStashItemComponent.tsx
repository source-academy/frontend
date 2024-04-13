import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { StashItemComponent } from '../StashItemComponent';
import { ArrayValue } from '../values/ArrayValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStashItemComponent extends GenericArrow<
  StashItemComponent,
  Frame | FnValue | GlobalFnValue | ArrayValue
> {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + from.width() / 2, y + from.height()],
      (x, y) => [to.x() + (to.x() < x ? to.width() / 2 : 0), to.y()]
    ];

    return steps;
  }
}
