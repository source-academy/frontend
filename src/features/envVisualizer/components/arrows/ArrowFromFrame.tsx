import { Config } from '../../EnvVisualizerConfig';
import { Frame } from '../Frame';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromFrame extends GenericArrow {
  protected calculatePoints() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];

    if (to instanceof Frame) {
      return [
        from.x + Config.FramePaddingX,
        from.y,
        from.x + Config.FramePaddingX,
        from.y - Config.FrameMarginY,
        to.x + Config.FramePaddingX,
        from.y - Config.FrameMarginY,
        to.x + Config.FramePaddingX,
        to.y + to.height
      ];
    }

    return [from.x + Config.FramePaddingX, from.y, to.x + Config.FramePaddingX, to.y + to.height];
  }
}
