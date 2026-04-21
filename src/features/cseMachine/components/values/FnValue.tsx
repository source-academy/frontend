import { KonvaEventObject } from 'konva/lib/Node';
import { Label } from 'konva/lib/shapes/Label';
import React, { RefObject } from 'react';
import { Circle, Group } from 'react-konva';

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
import { ArrowFromFnTooltip } from '../arrows/ArrowFromFnTooltip';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { FunctionTooltipLabels, Value } from './Value';

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
  private tooltipArrow: ArrowFromFnTooltip | undefined;
  private showTooltipArrow: boolean = false;

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
      const ghostY = Layout.getGhostFrameY(newReference.frame.environment.id);
      // if frame x coordinate exitst use it, if not use live value
      const frameX = ghostX !== undefined ? ghostX : newReference.frame.x();
      this._x = frameX + newReference.frame.width() + Config.FrameMarginX;
      const frameY = ghostY !== undefined ? ghostY : newReference.frame.y();
      const relativeOffset = newReference.y() - newReference.frame.y();
      this._y = frameY + relativeOffset;
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
    this.ref.current?.getParent()?.moveToTop();
    if (this.isExpandedDescription && this.isTooltipTruncated) {
      this.labelRef.current?.hide();
      this.revealLabelRef.current?.moveToTop();
      this.revealLabelRef.current?.show();
      this.revealLabelRef.current?.getLayer()?.batchDraw();
    } else {
      this.revealLabelRef.current?.hide();
      this.labelRef.current?.moveToTop();
      this.labelRef.current?.show();
      this.labelRef.current?.getLayer()?.batchDraw();
    }
    this.showTooltipArrow = true;
    this.tooltipArrow?.setVisible(true);
    currentTarget.getLayer()?.batchDraw();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setUnhoveredCursor(currentTarget);
    this.isExpandedDescription = false;
    this.labelRef.current?.hide();
    this.revealLabelRef.current?.hide();
    this.showTooltipArrow = false;
    this.tooltipArrow?.setVisible(false);
  };

  onClick = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode() || !this.isTooltipTruncated) return;
    this.ref.current?.getParent()?.moveToTop();
    this.isExpandedDescription = true;
    this.labelRef.current?.hide();
    this.revealLabelRef.current?.moveToTop();
    this.revealLabelRef.current?.show();
    currentTarget.getLayer()?.batchDraw();
  };

  private getActiveTooltipLabel() {
    if (!CseMachine.getPrintableMode() && this.isTooltipTruncated && this.isExpandedDescription) {
      return this.revealLabelRef.current;
    }
    return this.labelRef.current;
  }

  private getTooltipRect = () => {
    const label = this.getActiveTooltipLabel();
    if (label && label.isVisible()) {
      const rect = label.getClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }

    const useExpanded =
      !CseMachine.getPrintableMode() && this.isTooltipTruncated && this.isExpandedDescription;
    const baseX = this.x() + Config.TextMargin;
    const baseY =
      this.y() + this.radius + Config.TextMargin + (useExpanded ? 0 : this.printDescriptionOffsetY);
    const text = useExpanded ? this.tooltip : this.exportTooltip;
    const width =
      Math.min(Config.FnDescriptionMaxWidth, getTextWidth(text)) + Config.FnTooltipTextPadding * 2;
    const height =
      getTextHeight(text, Config.FnDescriptionMaxWidth) + Config.FnTooltipTextPadding * 2;

    return { x: baseX, y: baseY, width, height };
  };

  setArrowSourceHighlightedStyle(): void {
    if (this.isLive()) {
      this.setShapesStyle(Config.HoverColor);
    } else {
      this.setShapesStyle(Config.HoverDeadColor);
    }
  }

  setArrowSourceNormalStyle(): void {
    const strokeColor = this.isLive() ? defaultStrokeColor() : fadedStrokeColor();
    this.setShapesStyle(strokeColor);
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
    if (!this.tooltipArrow) {
      this.tooltipArrow = new ArrowFromFnTooltip(this, this.getTooltipRect);
    }
    this.tooltipArrow.setVisible(CseMachine.getPrintableMode() || this.showTooltipArrow);

    const isLive: boolean = this.isLive();
    const textColor = isLive ? defaultTextColor() : fadedTextColor();
    const strokeColor = isLive ? defaultStrokeColor() : fadedStrokeColor();
    Layout.registerOverlayNode(
      <FunctionTooltipLabels
        key={Layout.key++}
        x={this.x()}
        y={this.y()}
        radius={this.radius}
        printDescriptionOffsetY={this.printDescriptionOffsetY}
        isTooltipTruncated={this.isTooltipTruncated}
        exportTooltip={this.exportTooltip}
        tooltip={this.tooltip}
        strokeColor={strokeColor}
        textColor={textColor}
        labelRef={this.labelRef}
        revealLabelRef={this.revealLabelRef}
      />
    );
    // Keep function objects rendered so they remain hoverable in clear-dead-frames mode.
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
        {this._arrow?.draw()}
        {this.tooltipArrow?.draw()}
      </React.Fragment>
    );
  }
}
