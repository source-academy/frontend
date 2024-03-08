import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { CompactConfig } from '../../CseMachineCompactConfig';
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

    const steps: StepsArray = [(x, y) => [x + from.width() / 1, y + from.height() / 2]];

    if (to.x() < from.x()) {
      steps.push((x, y) => [x + CompactConfig.TextMargin, y]);
      steps.push((x, y) => [x, y - from.height() / 2 - CompactConfig.TextMargin]);
      steps.push((x, y) => [to.x() + to.width() + CompactConfig.ArrowHeadSize, y]);
      steps.push((x, y) => [x, to.y()]);
      steps.push((x, y) => [x - CompactConfig.ArrowHeadSize, y]);
    } else {
      steps.push((x, y) => [to.x(), to.y()]);
    }

    return steps;
  }
}
