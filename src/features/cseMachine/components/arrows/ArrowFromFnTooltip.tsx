import type { ReactNode } from 'react';

import { Config } from '../../CseMachineConfig';
import { StepsArray } from '../../CseMachineTypes';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { Visible } from '../Visible';
import { GenericArrow } from './GenericArrow';

type TooltipRect = { x: number; y: number; width: number; height: number };

type FnLike = FnValue | GlobalFnValue;

class FnLeftCircleAnchor extends Visible {
  constructor(private readonly fn: FnLike) {
    super();
  }

  x(): number {
    return this.fn.x() + this.fn.radius;
  }

  y(): number {
    return this.fn.y();
  }

  width(): number {
    return Config.FnInnerRadius * 2;
  }

  height(): number {
    return Config.FnInnerRadius * 2;
  }

  draw(): ReactNode {
    return null;
  }
}

class FnTooltipAnchor extends Visible {
  constructor(
    private readonly getRect: () => TooltipRect,
    private readonly getSourceX: () => number
  ) {
    super();
  }

  private rect(): TooltipRect {
    return this.getRect();
  }

  x(): number {
    return this.getSourceX();
  }

  y(): number {
    return this.rect().y;
  }

  width(): number {
    return this.rect().width;
  }

  height(): number {
    return this.rect().height;
  }

  draw(): ReactNode {
    return null;
  }
}

/** Arrow from the left function circle to the function tooltip label. */
export class ArrowFromFnTooltip extends GenericArrow<FnLeftCircleAnchor, FnTooltipAnchor> {
  private readonly fn: FnLike;

  constructor(fn: FnLike, getTooltipRect: () => TooltipRect) {
    const source = new FnLeftCircleAnchor(fn);
    super(source);
    this.fn = fn;
    this.to(new FnTooltipAnchor(getTooltipRect, () => source.x()));
    this.updateIsLive();
  }

  protected updateIsLive(): void {
    if (this.fn instanceof FnValue) {
      this.isLive = this.fn.isLive();
    } else {
      this.isLive = this.fn.isReferenced();
    }
  }

  protected calculateSteps(): StepsArray {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    // GenericArrow drops the very first source coordinate, so we emit two points:
    // 1) source center anchor, 2) tooltip anchor. This guarantees a visible line body.
    return [() => [from.x(), from.y()], () => [to.x(), to.y()]];
  }

  protected isInteractive(): boolean {
    return false;
  }
}
