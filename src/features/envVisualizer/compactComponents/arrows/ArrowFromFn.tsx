import { Frame } from 'src/features/envVisualizer/compactComponents/Frame';
import { FnValue } from 'src/features/envVisualizer/compactComponents/values/FnValue';
import { GlobalFnValue } from 'src/features/envVisualizer/compactComponents/values/GlobalFnValue';
import { CompactConfig } from 'src/features/envVisualizer/EnvVisualizerCompactConfig';
import { StepsArray } from 'src/features/envVisualizer/EnvVisualizerTypes';

import { GenericArrow } from './GenericArrow';

/** this class encapsulates an GenericArrow to be drawn between 2 points */
export class ArrowFromFn extends GenericArrow<FnValue | GlobalFnValue, Frame> {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [(x, y) => [x + CompactConfig.FnRadius * 3, y]];

    if (to.y() < from.y() && from.y() < to.y() + to.height()) {
      steps.push((x, y) => [x, y - CompactConfig.FnRadius * 2]);
      steps.push((x, y) => [to.x() + (from.x() < to.x() ? 0 : to.width()), y]);
    } else {
      steps.push(() => [to.x() + to.width() / 2, to.y() + (to.y() < from.y() ? to.height() : 0)]);
    }

    return steps;
  }
}
