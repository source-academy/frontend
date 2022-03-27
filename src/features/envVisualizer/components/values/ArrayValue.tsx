import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Data, Hoverable, ReferenceType } from '../../EnvVisualizerTypes';
import { setUnhoveredStyle } from '../../EnvVisualizerUtils';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayLevel } from '../ArrayLevel';
import { ArrayUnit } from '../ArrayUnit';
import { Arrow } from '../arrows/Arrow';
import { GenericArrow } from '../arrows/GenericArrow';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value implements Hoverable {
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;

  /** check if the value is already drawn */
  private _isDrawn: boolean = false;
  /** array of units this array is made of */
  units: ArrayUnit[] = [];
  private emptyUnit: ArrayEmptyUnit | undefined = undefined;
  level: ArrayLevel | undefined;
  private _arrows: Arrow[] = [];
  // private childrenArrows: Arrow[] = [];
  private selected: boolean = false;
  ref: RefObject<any> = React.createRef();
  parentArray: ArrayValue | undefined = undefined;
  arrayLevelY: number = -1;

  constructor(
    /** underlying values this array contains */
    readonly data: Data[],
    /** what this value is being referenced by */
    readonly referencedBy: ReferenceType[]
  ) {
    super();
    Layout.memoizeValue(this);

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX;
      this._y = mainReference.y();
    } else {
      this.parentArray = mainReference.parent;
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y();
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
    }

    this._width = this.data.length * Config.DataUnitWidth + Config.DataMinWidth;
    this._height = Config.DataUnitHeight;

    // initialize array units from the last index
    for (let i = this.data.length - 1; i >= 0; i--) {
      const unit = new ArrayUnit(i, this.data[i], this);

      // update the dimensions, so that children array values can derive their coordinates
      // from these intermediate dimensions

      this.units = [unit, ...this.units];
    }
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }
  isDrawn(): boolean {
    return this._isDrawn;
  }
  isSelected(): boolean {
    return this.selected;
  }
  arrows(): Arrow[] {
    return this._arrows;
  }
  reset(): void {
    this._isDrawn = false;
    this.units.map(x => x.reset());
    this.referencedBy.length = 0;
    this._arrows = [];
  }

  onClick = () => {
    this.selected = !this.selected;
    if (!this.selected) {
      this.units.forEach(u => {
        setUnhoveredStyle(u.ref.current);
      });
      this.emptyUnit && setUnhoveredStyle(this.emptyUnit.ref.current);
    }
  };

  setLevel(arrLevel: ArrayLevel, level: number): void {
    this.level = arrLevel;
    this.arrayLevelY = level;
  }

  updatePosition(pos: { x: number; y: number } = { x: -1, y: -1 }): void {
    this._x = pos.x > 0 ? pos.x : this._x;
    this._y = pos.y > 0 ? pos.y : this._y;
    this.units.forEach(unit => {
      unit.updatePosition();
    });
  }

  addArrow = (arrow: Arrow) => {
    this._arrows.push(arrow);
  };

  draw(): React.ReactNode {
    if (this.isDrawn()) {
      return null;
    }
    this._isDrawn = true;
    this._arrows = (this.referencedBy.filter(x => x instanceof Binding) as Binding[]).map(x => {
      const arrow: Arrow = Arrow.from(x.key).to(this);
      x.frame.trackObjects(this);
      x.frame.trackObjects(arrow);
      return arrow;
    }) as GenericArrow[];
    if (this.units.length === 0) {
      this.emptyUnit = new ArrayEmptyUnit(this);
    }
    return (
      <Group
        key={Layout.key++}
        ref={this.ref}
        // onClick={this.onClick}
        // onMouseEnter={this.onMouseEnter}
        // onMouseLeave={this.onMouseLeave}
      >
        {this._arrows.map(arrow => arrow.draw())}
        {this.units.length > 0 && this.units.map(unit => unit.draw())}
        {this.emptyUnit && this.emptyUnit.draw()}
        <Rect width={this.width()} height={this.height()} />
      </Group>
    );
  }
}
