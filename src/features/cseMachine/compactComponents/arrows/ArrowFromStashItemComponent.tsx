import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { CompactConfig } from '../../CseMachineCompactConfig';
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

    const steps: StepsArray = [(x, y) => [x + from.width() / 2, y + from.height() / 1]];

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
