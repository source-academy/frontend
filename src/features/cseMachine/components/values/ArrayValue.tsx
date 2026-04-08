import Closure from 'js-slang/dist/cse-machine/closure';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { DataArray, IHoverable, ReferenceType } from '../../CseMachineTypes';
import { isMainReference } from '../../CseMachineUtils';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayUnit } from '../ArrayUnit';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { FnValue } from './FnValue';
import { GlobalFnValue } from './GlobalFnValue';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value implements IHoverable {
  /** frame that encloses this array, if any */
  enclosingFrame?: Frame;
  /** array of units this array is made of */
  units: ArrayUnit[] = [];
  /** width of the array or the nested values inside the array. */
  totalWidth: number = 0;
  /** height of the array and nested values inside the array */
  totalHeight: number = 0;

  constructor(
    /** underlying values this array contains */
    readonly data: DataArray,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    Layout.memoizeValue(data, this);
    this.addReference(firstReference);
    /** handling pairs for stream visualisation */
    if (data[1] instanceof Closure) {
      // console.log("array with nullary func id: " + data[1].id);
      // console.log("array is created from fn with id: " + CseMachine.findKeyByValueInMap(data.id));
      // CseMachine.viewStreamLineage;
      const originFnId = CseMachine.findKeyByValueInMap(data.id);
      // console.log("origin fn: " + originFnId);
      // console.log(Layout.values);
      if (originFnId != undefined) {
        // console.log("result of finding fn that created this array: " + Layout.values.get(originFnId));
        const originFnValue = Layout.values.get(originFnId);
        if (originFnValue instanceof FnValue) {
          originFnValue.addArrow(this);
        } else {
          Layout.pendingFnLink = true;
        }
      }
    }
  }

  handleNewReference(newReference: ReferenceType): void {
    if (!isMainReference(this, newReference)) return;

    // derive the coordinates from the main reference (binding / array unit)
    if (newReference instanceof Binding) {
      this.enclosingFrame = newReference.frame;
      // check for whether cache already has x cooridnates
      const ghostX = Layout.getGhostFrameX(newReference.frame.environment.id);
      const ghostY = Layout.getGhostFrameY(newReference.frame.environment.id);
      // If frame x coordinates exists in cache, use it. Otherwise, fallback to current (live) X.
      const frameX = ghostX !== undefined ? ghostX : newReference.frame.x();
      const frameY = ghostY !== undefined ? ghostY : newReference.frame.y();
      this._x = frameX + newReference.frame.width() + Config.FrameMarginX;
      const relativeOffset = newReference.y() - newReference.frame.y();
      this._y = frameY + relativeOffset;
    } else {
      if (newReference.isLastUnit) {
        this._x = newReference.x() + Config.DataUnitWidth * 2;
        this._y = newReference.y();
      } else {
        this._x = newReference.x();
        this._y = newReference.y() + newReference.parent.totalHeight + Config.DataUnitHeight;
      }
    }

    this._width = Math.max(this.data.length * Config.DataUnitWidth, Config.DataMinWidth);
    this.totalWidth = this._width;
    this._height = Config.DataUnitHeight;
    this.totalHeight = this._height;

    this.units = new Array(this.data.length);
    // initialize array units from the last index
    for (let i = this.data.length - 1; i >= 0; i--) {
      const unit = new ArrayUnit(i, this.data[i], this);

      // Update total width and height for values that are drawn next to the array
      if (
        (unit.value instanceof ArrayValue ||
          unit.value instanceof FnValue ||
          unit.value instanceof GlobalFnValue) &&
        isMainReference(unit.value, unit)
      ) {
        const childWidth =
          unit.value instanceof ArrayValue
            ? unit.value.totalWidth
            : CseMachine.getPrintableMode()
              ? unit.value.totalWidth
              : unit.value.width();

        const bottomY =
          unit.value instanceof ArrayValue
            ? unit.value.y() + unit.value.totalHeight
            : CseMachine.getPrintableMode()
              ? unit.value.y() +
                Config.FnRadius +
                Config.TextMargin +
                unit.value.printDescriptionOffsetY +
                unit.value.printDescriptionHeight +
                unit.value.printDescriptionBottomGap
              : unit.value.y() + unit.value.height() / 2;

        this.totalWidth = Math.max(
          this.totalWidth,
          childWidth +
            (i === this.data.length - 1 ? (i + 2) * Config.DataUnitWidth : i * Config.DataUnitWidth)
        );
        this.totalHeight = Math.max(this.totalHeight, bottomY - unit.y());
      }

      this.units[i] = unit;
    }
  }

  setArrowSourceHighlightedStyle(): void {
    this.units.forEach(unit => unit.setArrowSourceHighlightedStyle());
  }

  setArrowSourceNormalStyle(): void {
    this.units.forEach(unit => unit.setArrowSourceNormalStyle());
  }

  isEnclosingFrameLive(): boolean {
    const id = (this.data as any).id;
    return id ? Layout.liveObjectIDs.has(id) : false;
  }

  isLive(): boolean {
    return this.isEnclosingFrameLive();
  }

  markAsReferenced() {
    if (this.isReferenced()) return;
    super.markAsReferenced();
    for (const unit of this.units) {
      unit.value.markAsReferenced();
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    for (const unit of this.units) {
      unit.showIndex();
    }
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    for (const unit of this.units) {
      unit.hideIndex();
    }
  };

  draw(): React.ReactNode {
    if (Layout.clearDeadFrames && !this.isLive()) {
      return null;
    }
    if (this.isDrawn()) return null;
    this._isDrawn = true;
    return (
      <Group
        key={Layout.key++}
        ref={this.ref}
        listening={false}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {this.units.length > 0
          ? this.units.map(unit => unit.draw())
          : new ArrayEmptyUnit(this).draw()}
      </Group>
    );
  }
}
