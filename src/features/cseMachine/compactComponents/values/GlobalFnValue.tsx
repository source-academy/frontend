import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import CseMachine from '../../CseMachine';
import { CompactConfig, ShapeDefaultProps } from '../../CseMachineCompactConfig';
import { Layout } from '../../CseMachineLayout';
import { CompactReferenceType, IHoverable } from '../../CseMachineTypes';
import { defaultSAColor, getBodyText, getParamsText, getTextWidth } from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this encapsulates a function from the global frame
 * (which has no extra props such as environment or fnName) */
export class GlobalFnValue extends Value implements IHoverable {
  centerX: number;
  readonly tooltipWidth: number;
  readonly exportTooltipWidth: number;
  readonly radius: number = CompactConfig.FnRadius;
  readonly innerRadius: number = CompactConfig.FnInnerRadius;
  private _arrow: ArrowFromFn | undefined;

  readonly paramsText: string;
  readonly bodyText: string;
  readonly exportBodyText: string;
  readonly tooltip: string;
  readonly exportTooltip: string;
  private selected: boolean = false;

  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying function */
    readonly data: () => any,
    /** what this value is being referenced by */
    readonly referencedBy: CompactReferenceType[]
  ) {
    super();
    Layout.memoizeCompactValue(this);

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x =
        mainReference.frame.x() + mainReference.frame.width() + CompactConfig.FrameMarginX / 4;
      this._y = mainReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + CompactConfig.DataUnitWidth * 2;
        this._y = mainReference.y() + CompactConfig.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + CompactConfig.DataUnitHeight;
      }
      this.centerX = this._x + CompactConfig.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
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
    this.exportTooltip = `${this.paramsText}\n${this.exportBodyText}`;
    this.tooltipWidth =
      Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText)) +
      CompactConfig.TextPaddingX;
    this.exportTooltipWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.exportBodyText)
    );
  }
  isSelected(): boolean {
    return this.selected;
  }
  arrow(): ArrowFromFn | undefined {
    return this._arrow;
  }

  updatePosition(): void {
    const mainReference = this.referencedBy.find(x => x instanceof Binding) || this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x =
        mainReference.frame.x() + mainReference.frame.width() + CompactConfig.FrameMarginX / 4;
      this._y = mainReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + CompactConfig.DataUnitWidth * 2;
        this._y = mainReference.y() + CompactConfig.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + CompactConfig.DataUnitHeight;
      }
      this.centerX = this._x + CompactConfig.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.labelRef.current.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      const container = currentTarget.getStage()?.container();
      container && (container.style.cursor = 'default');
    }
  };
  onClick = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.selected = !this.selected;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      this.labelRef.current.show();
    }
  };

  draw(): React.ReactNode {
    this._isDrawn = true;
    this._arrow =
      Layout.globalEnvNode.compactFrame &&
      (new ArrowFromFn(this).to(Layout.globalEnvNode.compactFrame) as ArrowFromFn);
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          onClick={e => this.onClick(e)}
          ref={this.ref}
        >
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={defaultSAColor()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={defaultSAColor()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={defaultSAColor()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={defaultSAColor()}
          />
        </Group>
        {CseMachine.getPrintableMode() ? (
          <KonvaLabel
            x={this.x() + this.width() + CompactConfig.TextPaddingX * 2}
            y={this.y() - CompactConfig.TextPaddingY}
            visible={true}
            ref={this.labelRef}
          >
            <KonvaTag
              stroke="black"
              fill={'white'}
              opacity={Number(CompactConfig.FnTooltipOpacity)}
            />
            <KonvaText
              text={this.exportTooltip}
              fontFamily={CompactConfig.FontFamily.toString()}
              fontSize={Number(CompactConfig.FontSize)}
              fontStyle={CompactConfig.FontStyle.toString()}
              fill={CompactConfig.SA_BLUE.toString()}
              padding={5}
            />
          </KonvaLabel>
        ) : (
          <KonvaLabel
            x={this.x() + this.width() + CompactConfig.TextPaddingX * 2}
            y={this.y() - CompactConfig.TextPaddingY}
            visible={false}
            ref={this.labelRef}
          >
            <KonvaTag
              stroke="black"
              fill={'black'}
              opacity={Number(CompactConfig.FnTooltipOpacity)}
            />
            <KonvaText
              text={this.tooltip}
              fontFamily={CompactConfig.FontFamily.toString()}
              fontSize={Number(CompactConfig.FontSize)}
              fontStyle={CompactConfig.FontStyle.toString()}
              fill={CompactConfig.SA_WHITE.toString()}
              padding={5}
            />
          </KonvaLabel>
        )}
        {Layout.globalEnvNode.compactFrame &&
          new ArrowFromFn(this).to(Layout.globalEnvNode.compactFrame).draw()}
      </React.Fragment>
    );
  }
}
