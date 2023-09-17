import { AgendaItemComponent } from 'src/features/envVisualizer/compactComponents/AgendaItemComponent';
import { Frame } from 'src/features/envVisualizer/compactComponents/Frame';
import { FnValue } from 'src/features/envVisualizer/components/values/FnValue';
import { GlobalFnValue } from 'src/features/envVisualizer/components/values/GlobalFnValue';
import { CompactConfig } from 'src/features/envVisualizer/EnvVisualizerCompactConfig';
import { StepsArray } from 'src/features/envVisualizer/EnvVisualizerTypes';

import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromAgendaItemComponent extends GenericArrow<
  AgendaItemComponent,
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
