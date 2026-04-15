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
import { GlobalFn, IHoverable } from '../../CseMachineTypes';
import {
  defaultBackgroundColor,
  defaultStrokeColor,
  defaultTextColor,
  fadedStrokeColor,
  fadedTextColor,
  getBodyText,
  getParamsText,
  getTextHeight,
  getTextWidth,
  setHoveredCursor,
  setUnhoveredCursor,
  truncateFunctionTooltip
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { ArrowFromFnTooltip } from '../arrows/ArrowFromFnTooltip';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this encapsulates a function from the global frame */
export class GlobalFnValue extends Value implements IHoverable {
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;

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
  readonly totalWidth: number;
  readonly labelRef: RefObject<Label | null> = React.createRef();
  readonly revealLabelRef: RefObject<Label | null> = React.createRef();

  centerX: number;
  private isExpandedDescription: boolean = false;
  private _arrow: ArrowFromFn | undefined;
  private tooltipArrow: ArrowFromFnTooltip | undefined;
  private showTooltipArrow: boolean = false;

  constructor(
    /** underlying function */
    readonly data: GlobalFn,
    /** what this value is being referenced by */
    mainReference: Binding
  ) {
    super();
    Layout.memoizeValue(data, this);
    // check for frame x cooridnate in cache
    const ghostX = Layout.getGhostFrameX(mainReference.frame.environment.id);
    const frameX = ghostX !== undefined ? ghostX : mainReference.frame.x();
    // derive the coordinates from the main reference (binding)
    // if frame x coordinate exitst use it, if not use live value
    this._x = frameX + mainReference.frame.width() + Config.FrameMarginX;
    this._y = mainReference.y();
    this.centerX = this._x + this.radius * 2;
    this._y += this.radius;

    this._width = this.radius * 4;
    this._height = this.radius * 2;

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

    this.addReference(mainReference);
  }

  handleNewReference(): void {}

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
    if (this.isReferenced()) {
      this.setShapesStyle(Config.HoverColor);
    } else {
      this.setShapesStyle(Config.HoverDeadColor);
    }
  }

  setArrowSourceNormalStyle(): void {
    const strokeColor = this.isReferenced() ? defaultStrokeColor() : fadedStrokeColor();
    this.setShapesStyle(strokeColor);
  }

  isLive(): boolean {
    return true;
  }

  private drawTooltipLabels(strokeColor: string, textColor: string): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        <KonvaLabel
          x={this.x() + Config.TextMargin}
          y={this.y() + this.radius + Config.TextMargin + this.printDescriptionOffsetY}
          visible={CseMachine.getPrintableMode()}
          listening={false}
          ref={this.labelRef}
        >
          <KonvaTag
            stroke={strokeColor}
            fill={defaultBackgroundColor()}
            cornerRadius={Config.FrameCornerRadius}
          />
          <KonvaText
            text={
              !CseMachine.getPrintableMode() && this.isTooltipTruncated
                ? `${this.exportTooltip}\n(click for full)`
                : this.exportTooltip
            }
            fontFamily={Config.FontFamily}
            fontSize={Config.FontSize}
            fontStyle={Config.FontStyle}
            fill={textColor}
            padding={Config.FnTooltipTextPadding}
            width={Config.FnDescriptionMaxWidth}
          />
        </KonvaLabel>
        {!CseMachine.getPrintableMode() && this.isTooltipTruncated && (
          <KonvaLabel
            x={this.x() + Config.TextMargin}
            y={this.y() + this.radius + Config.TextMargin}
            visible={false}
            listening={false}
            ref={this.revealLabelRef}
          >
            <KonvaTag
              stroke={strokeColor}
              fill={defaultBackgroundColor()}
              cornerRadius={Config.FrameCornerRadius}
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
      </React.Fragment>
    );
  }

  draw(): React.ReactNode {
    this._isDrawn = true;
    if (Layout.globalEnvNode.frame) {
      this._arrow = new ArrowFromFn(this).to(Layout.globalEnvNode.frame) as ArrowFromFn;
    }
    if (!this.tooltipArrow) {
      this.tooltipArrow = new ArrowFromFnTooltip(this, this.getTooltipRect);
    }
    this.tooltipArrow.setVisible(CseMachine.getPrintableMode() || this.showTooltipArrow);
    const textColor = this.isReferenced() ? defaultTextColor() : fadedTextColor();
    const strokeColor = this.isReferenced() ? defaultStrokeColor() : fadedStrokeColor();
    Layout.registerOverlayNode(this.drawTooltipLabels(strokeColor, textColor));
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
