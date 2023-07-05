import { FnValue } from '../../components/values/FnValue';
import { GlobalFnValue } from '../../components/values/GlobalFnValue';
import { CompactConfig } from '../../EnvVisualizerCompactConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { Frame } from '../Frame';
import { StackItemComponent } from '../StackItemComponent';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromStackItemComponent extends GenericArrow<
  StackItemComponent,
  Frame | FnValue | GlobalFnValue
> {
  constructor(from: StackItemComponent, readonly isAgenda: boolean) {
    super(from);
  }

  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [
        x + from.width() / (this.isAgenda ? 1 : 2),
        y + from.height() / (this.isAgenda ? 2 : 1)
      ]
    ];

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
