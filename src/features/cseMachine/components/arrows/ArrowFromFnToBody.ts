import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { FnBodyTarget } from './FnBodyTarget';
import { GenericArrow } from './GenericArrow';

/** Arrow from first function circle to its description tooltip. */
export class ArrowFromFnToBody extends GenericArrow<FnValue | GlobalFnValue, FnBodyTarget> {
  constructor(from: FnValue | GlobalFnValue) {
    super(from);
    this.isLive = from instanceof GlobalFnValue ? true : from.isLive();
  }

  protected updateIsLive(): void {
    this.isLive = this.source instanceof GlobalFnValue ? true : this.source.isLive();
  }

  protected isInteractive(): boolean {
    return false;
  }

  protected getOriginFilterKey() {
    return 'function' as const;
  }

  protected calculateSteps(): StepsArray {
    const to = this.target;
    if (!to) return [];

    const targetY = to.y();

    return [(x, y) => [x + Config.FnRadius, y], (x, _y) => [x, targetY]];
  }
}
