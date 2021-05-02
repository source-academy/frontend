import { Visible } from '../../EnvVisualizerTypes';
import { ArrayUnit } from '../ArrayUnit';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { ArrowFromArrayUnit } from './ArrowFromArrayUnit';
import { ArrowFromFn } from './ArrowFromFn';
import { ArrowFromFrame } from './ArrowFromFrame';
import { ArrowFromText } from './ArrowFromText';
import { GenericArrow } from './GenericArrow';

/** this class contains a factory method for an arrow to be drawn between 2 points */
export class Arrow {
  /** factory method that returns the corresponding arrow depending on where the arrow is `from` */
  static from(from: Visible) {
    if (from instanceof Frame) return new ArrowFromFrame(from);
    if (from instanceof FnValue || from instanceof GlobalFnValue) return new ArrowFromFn(from);
    if (from instanceof Text) return new ArrowFromText(from);
    if (from instanceof ArrayUnit) return new ArrowFromArrayUnit(from);

    // else return a generic arrow
    return new GenericArrow(from);
  }
}
