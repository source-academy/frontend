import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { Data, ReferenceType } from '../../CseMachineTypes';
import { setUnhoveredStyle } from '../../CseMachineUtils';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayLevel } from '../ArrayLevel';
import { ArrayUnit } from '../ArrayUnit';
import { ArrowFromText } from '../arrows/ArrowFromText';
import { GenericArrow } from '../arrows/GenericArrow';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value {
  /** array of units this array is made of */
  units: ArrayUnit[] = [];
  private emptyUnit: ArrayEmptyUnit | undefined = undefined;
  level: ArrayLevel | undefined;
  private _arrows: (GenericArrow<Text, ArrayValue> | GenericArrow<ArrayUnit, Value>)[] = [];
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
      this.units = [unit, ...this.units];
    }
  }
  onMouseEnter(): void {}
  onMouseLeave(): void {}
  isSelected(): boolean {
    return this.selected;
  }
  arrows(): (GenericArrow<Text, ArrayValue> | GenericArrow<ArrayUnit, Value>)[] {
    return this._arrows;
  }
  reset(): void {
    super.reset();
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

  addArrow = (arrow: GenericArrow<Text, ArrayValue> | GenericArrow<ArrayUnit, Value>) => {
    this._arrows.push(arrow);
  };

  draw(): React.ReactNode {
    if (this.isDrawn()) {
      return null;
    }
    this._isDrawn = true;
    this._arrows = (this.referencedBy.filter(x => x instanceof Binding) as Binding[]).map(x => {
      const arrow: GenericArrow<Text, ArrayValue> = new ArrowFromText<ArrayValue>(x.key).to(this);
      x.frame.trackObjects(this);
      x.frame.trackObjects(arrow);
      return arrow;
    }) as GenericArrow<Text, ArrayValue>[];
    if (this.units.length === 0) {
      this.emptyUnit = new ArrayEmptyUnit(this);
    }
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {this._arrows.map(arrow => arrow.draw())}
        {this.units.length > 0 && this.units.map(unit => unit.draw())}
        {this.emptyUnit && this.emptyUnit.draw()}
        <Rect width={this.width()} height={this.height()} />
      </Group>
    );
  }
}
