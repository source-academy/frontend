import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';

import { ArrayUnit } from '../ArrayUnit';
import { ControlItemComponent } from '../ControlItemComponent';
import { Frame } from '../Frame';
import { StashItemComponent } from '../StashItemComponent';
import { Text } from '../Text';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Visible } from '../Visible';
import { ArrowFromArrayUnit } from './ArrowFromArrayUnit';
import { ArrowFromControlItemComponent } from './ArrowFromControlItemComponent';
import { ArrowFromFn } from './ArrowFromFn';
import { ArrowFromFrame } from './ArrowFromFrame';
import { ArrowFromStashItemComponent } from './ArrowFromStashItemComponent';
import { ArrowFromText } from './ArrowFromText';
import { GenericArrow } from './GenericArrow';

/** this class contains a factory method for an arrow to be drawn between 2 points */
export abstract class Arrow {
  abstract draw: (key?: number) => React.ReactNode;
  abstract onMouseEnter(e: KonvaEventObject<MouseEvent>): void;
  abstract onMouseLeave(e: KonvaEventObject<MouseEvent>): void;
  abstract onClick(e: KonvaEventObject<MouseEvent>): void;
  abstract source: Visible;
  abstract target: Visible | undefined;
  abstract ref: RefObject<any>;
  abstract x(): number;
  abstract y(): number;
  abstract height(): number;
  abstract width(): number;
  abstract isSelected(): boolean;
  abstract path(): string;

  /** factory method that returns the corresponding arrow depending on where the arrow is `from` */
  public static from(source: Visible): GenericArrow<Visible, Visible> {
    if (source instanceof Frame) return new ArrowFromFrame(source);
    if (source instanceof FnValue || source instanceof GlobalFnValue)
      return new ArrowFromFn(source);
    if (source instanceof Text) return new ArrowFromText(source);
    if (source instanceof ArrayUnit) return new ArrowFromArrayUnit(source);
    if (source instanceof ControlItemComponent) return new ArrowFromControlItemComponent(source);
    if (source instanceof StashItemComponent) return new ArrowFromStashItemComponent(source);

    // else return a generic arrow
    return new GenericArrow(source);
  }

  /** setter for target of arrow. */
  abstract to(to: Visible): Arrow;
}
