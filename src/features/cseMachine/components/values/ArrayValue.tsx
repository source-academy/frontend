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
import { FnValue } from './FnValue';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value implements IHoverable {
  /** array of units this array is made of */
  units: ArrayUnit[] = [];
  /** width of the array or the nested values inside the array. */
  totalWidth: number = 0;
  /** height of the array and nested values inside the array */
  totalHeight: number = 0;

  private arrayIdWithinStream: number = 0;

  private streamId: number = 0;

  private visualisationX: number = 0;

  private visualisationY: number = 0;

  constructor(
    /** underlying values this array contains */
    readonly data: DataArray,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    Layout.memoizeValue(data, this);
    
    const streamIdString = CseMachine.getStreamPairIdToStreamId(data.id);

    if (streamIdString != undefined) {
      this.streamId = parseInt(streamIdString);
      const streamPairCount = Layout.streamLengthMap.get(streamIdString);
      if (streamPairCount != undefined) {
        Layout.streamLengthMap.set(streamIdString, streamPairCount + 1);
        this.arrayIdWithinStream = streamPairCount;
      } else {
        Layout.streamLengthMap.set(streamIdString, 1);
        this.arrayIdWithinStream = 0;
      }
    }

    // Figure out the coordinates
    const parentCount = CseMachine.getStreamPairIdToParentCounts(data.id);
    if (Layout.streamCoords[this.streamId] == undefined) {
      Layout.streamCoords[this.streamId] = [];
    }
      
    if (parentCount != undefined) {
      if (Layout.streamCoords[this.streamId][parentCount] == undefined) {
        Layout.streamCoords[this.streamId][parentCount] = 1;
      } else {
        Layout.streamCoords[this.streamId][parentCount]++;
      }

      this.visualisationY = Layout.streamCoords[this.streamId][parentCount];
      this.visualisationX = this.arrayIdWithinStream;
      console.log("My x is: " + this.visualisationX);
      console.log("My y is: " + this.visualisationY);
    }


    // if (this.arrayId > 0 && Layout.streamPairArray[this.arrayId - 1].data[1] instanceof Closure) {
    //   let prevFn: FnValue = Layout.streamPairArray[this.arrayId - 1].data[1];
    //   prevFn.arrow = new
    // }
    
    this.addReference(firstReference);
    /** handling pairs for stream visualisation */
    if (data[1] instanceof Closure) {
      // console.log("array with nullary func id: " + data[1].id);
      // console.log("array is created from fn with id: " + CseMachine.findKeyByValueInMap(data.id));
      // CseMachine.viewStreamLineage;
      const originFnId = CseMachine.findKeyByValueInMap(data.id);
      console.log("origin fn: " + originFnId);
      console.log(Layout.values);
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
      if (!CseMachine.getPairCreationMode()) {
        this._x = newReference.frame.x() + newReference.frame.width() + Config.FrameMarginX;
        this._y = newReference.y();
      } else {
        this._x = Config.CanvasPaddingX + this.visualisationX * (Config.DataUnitWidth * 5);
        this._y = (Config.DataUnitHeight * 2) * this.visualisationY;
      }
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
        (unit.value instanceof ArrayValue || unit.value instanceof FnValue) &&
        isMainReference(unit.value, unit)
      ) {
        this.totalWidth = Math.max(
          this.totalWidth,
          unit.value.totalWidth +
            (i === this.data.length - 1 ? (i + 2) * Config.DataUnitWidth : i * Config.DataUnitWidth)
        );
        this.totalHeight = Math.max(
          this.totalHeight,
          unit.value.y() +
            (unit.value instanceof ArrayValue ? unit.value.totalHeight : unit.value.height() / 2) -
            unit.y()
        );
      }

      this.units[i] = unit;
    }
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
    if (this.isDrawn()) return null;
    this._isDrawn = true;
    return (
      <Group
        key={Layout.key++}
        ref={this.ref}
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
