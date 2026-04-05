import { KonvaEventObject } from 'konva/lib/Node';
import { Label } from 'konva/lib/shapes/Label';
import { _isEventFromThisInstance } from 'node_modules/ag-grid-community/dist/types/src/agStack/utils/event';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IHoverable, NonGlobalFn, ReferenceType } from '../../CseMachineTypes';
import {
  defaultStrokeColor,
  defaultTextColor,
  fadedStrokeColor,
  fadedTextColor,
  getBodyText,
  getParamsText,
  getTextWidth,
  isMainReference,
  isStreamFn,
  setHoveredCursor,
  setUnhoveredCursor
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { ArrowFromStreamNullaryFn } from '../arrows/ArrowFromStreamNullaryFn';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { ArrayValue } from './ArrayValue';
import { Value } from './Value';

/** this class encapsulates a JS Slang function (not from the global frame) that
 *  contains extra props such as environment and fnName */
export class FnValue extends Value implements IHoverable {
  /** name of this function */
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;

  readonly fnName: string;
  readonly paramsText: string;
  readonly bodyText: string;
  readonly exportBodyText: string;
  readonly tooltip: string;
  readonly tooltipWidth: number;
  readonly exportTooltip: string;
  readonly exportTooltipWidth: number;

  /** width of the closure circles + label */
  readonly totalWidth: number;
  readonly labelRef: RefObject<Label> = React.createRef();

  centerX: number;
  enclosingFrame?: Frame;
  private _arrow: ArrowFromFn | undefined;
  private _streamArrows: ArrowFromStreamNullaryFn[] = [];

  constructor(
    /** underlying JS Slang function (contains extra props) */
    readonly data: NonGlobalFn,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    //console.log(CseMachine.getStreamLineage((data as any).id))
    Layout.memoizeValue(data, this);
    this.centerX = 0;
    this._width = this.radius * 4;
    this._height = this.radius * 2;
    this.fnName = isStreamFn(this.data) ? '' : this.data.functionName;
    // this.paramsText = `params: ${getParamsText(this.data)}`;
    // this.bodyText = `body: ${getBodyText(this.data)}`;
    this.paramsText = `params: ${getParamsText(this.data)}`;
    this.bodyText = `id: ${(this.data as any).id}`;

    this.exportBodyText =
      (this.bodyText.length > 23 ? this.bodyText.slice(0, 20) : this.bodyText)
        .split('\n')
        .slice(0, 2)
        .join('\n') + ' ...';
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.exportTooltip = `${this.paramsText}\n${this.exportBodyText}`;
    this.tooltipWidth = Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText));
    this.exportTooltipWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.exportBodyText)
    );
    this.totalWidth =
      this._width +
      Config.TextPaddingX * 2 +
      10 +
      (CseMachine.getPrintableMode() ? this.exportTooltipWidth : this.tooltipWidth);
    
    // remember to delete this if its fixed
    if (Layout.pendingFnLink) {
      const thisId = (data as any).id
      const linkedPairs = CseMachine.getStreamLineage(thisId);

      
      if (linkedPairs != undefined && CseMachine.getStreamLineage(thisId) != undefined) {
        // console.log(CseMachine.getStreamLineage(thisId))
        const targetCounts = new Map<ArrayValue, number>();

        for (const pair of linkedPairs) {
          const pairObject = (Layout.values.get(pair) as ArrayValue);
          // The pair might not be in Layout.values if it's not reachable in the current step, so we check.
          if (pairObject instanceof ArrayValue) {
            const currentCount = targetCounts.get(pairObject) || 0;
            targetCounts.set(pairObject, currentCount + 1);

            this._streamArrows.push(new ArrowFromStreamNullaryFn(this).to(pairObject) as ArrowFromStreamNullaryFn);
            this._streamArrows[this._streamArrows.length - 1].draw();
          }
        }

        for (const arrow of this._streamArrows) {
          arrow.draw();
        }
      }

      Layout.pendingFnLink = false;
    }
    this.addReference(firstReference);
  }

  handleNewReference(newReference: ReferenceType): void {
    if (!isMainReference(this, newReference)) return;

    // derive the coordinates from the main reference (binding / array unit)
    if (newReference instanceof Binding) {
      this._x = newReference.frame.x() + newReference.frame.width() + Config.FrameMarginX;
      this._y = newReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (newReference.isLastUnit) {
        this._x = newReference.x() + Config.DataUnitWidth * 2;
        this._y = newReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = newReference.x();
        this._y = newReference.y() + newReference.parent.totalHeight + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;
  }

  arrow(): ArrowFromFn | undefined {
    return this._arrow;
  }

  addArrow(target: any): void {
    // this._streamArrows?.push(new ArrowFromStreamNullaryFn(this).to(target) as ArrowFromStreamNullaryFn)

    // Check how many arrows already point to this specific target
    const currentCount = this._streamArrows.filter(arrow => arrow.target === target).length;
    
    // Pass the count as the offsetIndex
    this._streamArrows?.push(
      new ArrowFromStreamNullaryFn(this, currentCount).to(target) as ArrowFromStreamNullaryFn
    );
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setHoveredCursor(currentTarget);
    this.labelRef.current?.moveToTop();
    this.labelRef.current?.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setUnhoveredCursor(currentTarget);
    this.labelRef.current?.hide();
  };

  draw(): React.ReactNode {
    const pairs = CseMachine.getStreamLineage((this.data as any).id);
    this._streamArrows = [];
    if (CseMachine.getPairCreationMode()) {
      // Clear arrows to prevent duplicates from multiple draw calls

      if(pairs != undefined) {
        for(const pair of pairs) {
          const target = Layout.values.get(pair);
          if (target) {
            this.addArrow(target);
          }
        }
      }
    }

    if (this.fnName === undefined) {
      throw new Error('Closure has no main reference and is not initialised!');
    }
    this.enclosingFrame = Frame.getFrom(this.data.environment);
    if (this.enclosingFrame && !CseMachine.getPairCreationMode()) {
      this._arrow = new ArrowFromFn(this).to(this.enclosingFrame) as ArrowFromFn;
    }
    const textColor = this.isReferenced() ? defaultTextColor() : fadedTextColor();
    const strokeColor = this.isReferenced() ? defaultStrokeColor() : fadedStrokeColor();
    return (
      <React.Fragment key={Layout.key++}>
        <Group onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} ref={this.ref}>
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={strokeColor}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={strokeColor}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={strokeColor}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={strokeColor}
          />
        </Group>
        <KonvaLabel
          x={this.x() + this.width() + Config.TextPaddingX * 2}
          y={this.y() - Config.TextPaddingY}
          visible={CseMachine.getPrintableMode()}
          ref={this.labelRef}
        >
          {CseMachine.getPrintableMode() ? (
            <KonvaTag stroke={strokeColor} />
          ) : (
            <KonvaTag
              stroke={Config.HoverBgColor}
              fill={Config.HoverBgColor}
              opacity={Config.FnTooltipOpacity}
            />
          )}
          <KonvaText
            text={CseMachine.getPrintableMode() ? this.exportTooltip : this.tooltip}
            fontFamily={Config.FontFamily}
            fontSize={Config.FontSize}
            fontStyle={Config.FontStyle}
            fill={textColor}
            padding={5}
          />
        </KonvaLabel>
        {this._arrow?.draw()}
        {this._streamArrows.map((arrow, index) => arrow.draw())}
      </React.Fragment>
    );
  }
}
