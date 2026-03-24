import { KonvaEventObject } from 'konva/lib/Node';
import { Label } from 'konva/lib/shapes/Label';
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
  getTextHeight,
  getTextWidth,
  isMainReference,
  isStreamFn,
  setHoveredCursor,
  setUnhoveredCursor,
  truncateFunctionTooltip
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
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
  readonly isTooltipTruncated: boolean;
  readonly printDescriptionHeight: number;
  readonly printDescriptionOffsetY: number;
  readonly printDescriptionBottomGap: number;

  /** width of the closure circles + label */
  readonly totalWidth: number;
  readonly labelRef: RefObject<Label | null> = React.createRef();
  readonly revealLabelRef: RefObject<Label | null> = React.createRef();

  centerX: number;
  enclosingFrame?: Frame;
  private isExpandedDescription: boolean = false;
  private _arrow: ArrowFromFn | undefined;

  constructor(
    /** underlying JS Slang function (contains extra props) */
    readonly data: NonGlobalFn,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    Layout.memoizeValue(data, this);

    this.centerX = 0;
    this._width = this.radius * 4;
    this._height = this.radius * 2;

    this.fnName = isStreamFn(this.data) ? '' : this.data.functionName;

    this.paramsText = `params: ${getParamsText(this.data)}`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
    this.exportBodyText =
      (this.bodyText.length > 23 ? this.bodyText.slice(0, 20) : this.bodyText)
        .split('\n')
        .slice(0, 2)
        .join('\n') + ' ...';
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.exportTooltip = truncateFunctionTooltip(
      this.tooltip,
      Config.FnDescriptionMaxWidth,
      Config.FnDescriptionMaxHeight
    );
    this.isTooltipTruncated = this.exportTooltip !== this.tooltip;
    this.tooltipWidth = Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText));
    this.exportTooltipWidth = Math.min(
      Config.FnDescriptionMaxWidth,
      getTextWidth(this.exportTooltip)
    );
    this.printDescriptionHeight =
      getTextHeight(this.exportTooltip, Config.FnDescriptionMaxWidth) +
      Config.FnTooltipTextPadding * 2;
    this.printDescriptionOffsetY = Math.ceil(Config.TextPaddingY / 2);
    this.printDescriptionBottomGap = Math.ceil(Config.TextPaddingY / 2);
    this.totalWidth =
      this._width + Config.TextMargin + this.exportTooltipWidth + Config.FnTooltipTextPadding * 2;

    this.addReference(firstReference);
  }

  handleNewReference(newReference: ReferenceType): void {
    if (!isMainReference(this, newReference)) return;

    // derive the coordinates from the main reference (binding / array unit)
    if (newReference instanceof Binding) {
      // check for frame x cooridnate in cache
      const ghostX = Layout.getGhostFrameX(newReference.frame.environment.id);
      // if frame x coordinate exitst use it, if not use live value
      const frameX = ghostX !== undefined ? ghostX : newReference.frame.x();
      this._x = frameX + newReference.frame.width() + Config.FrameMarginX;
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

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setHoveredCursor(currentTarget);
    if (this.isExpandedDescription && this.isTooltipTruncated) {
      this.labelRef.current?.hide();
      this.revealLabelRef.current?.moveToTop();
      this.revealLabelRef.current?.show();
    } else {
      this.revealLabelRef.current?.hide();
      this.labelRef.current?.moveToTop();
      this.labelRef.current?.show();
    }
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setUnhoveredCursor(currentTarget);
    this.isExpandedDescription = false;
    this.labelRef.current?.hide();
    this.revealLabelRef.current?.hide();
  };

  onClick = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode() || !this.isTooltipTruncated) return;
    this.isExpandedDescription = true;
    this.labelRef.current?.hide();
    this.revealLabelRef.current?.moveToTop();
    this.revealLabelRef.current?.show();
    currentTarget.getLayer()?.batchDraw();
  };

  setArrowSourceHighlightedStyle(): void {
    const shapes = this.ref.current?.getChildren?.() ?? [];
    shapes.forEach((shape: any) => {
      if (shape.attrs.stroke) shape.stroke(Config.HoverColor);
      if (shape.attrs.fill) shape.fill(Config.HoverColor);
    });
  }

  setArrowSourceNormalStyle(): void {
    const strokeColor = this.isLive() ? defaultStrokeColor() : fadedStrokeColor();
    const shapes = this.ref.current?.getChildren?.() ?? [];
    shapes.forEach((shape: any) => {
      if (shape.attrs.stroke) shape.stroke(strokeColor);
      if (shape.attrs.fill) shape.fill(strokeColor);
    });
  }

  isLive(): boolean {
    const id = (this.data as any).id;
    return id ? Layout.liveObjectIDs.has(id) : false;
  }

  draw(): React.ReactNode {
    if (this.fnName === undefined) {
      throw new Error('Closure has no main reference and is not initialised!');
    }
    //update center x accourding to the same id from cache
    this.centerX = this.x() + this.radius * 2;
    this.enclosingFrame = Frame.getFrom(this.data.environment);
    if (this.enclosingFrame) {
      this._arrow = new ArrowFromFn(this).to(this.enclosingFrame) as ArrowFromFn;
    }

    const isLive: boolean = this.isLive();
    const textColor = isLive ? defaultTextColor() : fadedTextColor();
    const strokeColor = isLive ? defaultStrokeColor() : fadedStrokeColor();
    //dont need to check isReferenced here since live is ALL we need to know
    if (Layout.clearDeadFrames && !isLive) {
      return null;
    }
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onClick={this.onClick}
          ref={this.ref}
        >
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
          x={this.x() + Config.TextMargin}
          y={this.y() + this.radius + Config.TextMargin + this.printDescriptionOffsetY}
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
            text={
              !CseMachine.getPrintableMode() && this.isTooltipTruncated
                ? `${this.exportTooltip}\n(click for full)`
                : this.exportTooltip
            }
            fontFamily={Config.FontFamily}
            fontSize={Config.FontSize}
            fontStyle={Config.FontStyle}
            fill={textColor} //even the text that appears on hover is faded if unreferenced
            padding={Config.FnTooltipTextPadding}
            width={Config.FnDescriptionMaxWidth}
          />
        </KonvaLabel>
        {!CseMachine.getPrintableMode() && this.isTooltipTruncated && (
          <KonvaLabel
            x={this.x() + Config.TextMargin}
            y={this.y() + this.radius + Config.TextMargin}
            visible={false}
            ref={this.revealLabelRef}
          >
            <KonvaTag
              stroke={Config.HoverBgColor}
              fill={Config.HoverBgColor}
              opacity={Config.FnTooltipOpacity}
            />
            <KonvaText
              text={this.tooltip}
              fontFamily={Config.FontFamily}
              fontSize={Config.FontSize}
              fontStyle={Config.FontStyle}
              fill={textColor}
              padding={Config.FnTooltipTextPadding}
            />
          </KonvaLabel>
        )}
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
