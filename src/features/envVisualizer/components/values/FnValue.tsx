import { Environment } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import { Config, ShapeDefaultProps } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { EnvTreeNode, FnTypes, Hoverable, ReferenceType } from '../../EnvVisualizerTypes';
import {
  getBodyText,
  getNonEmptyEnv,
  getParamsText,
  getTextWidth,
  setHoveredStyle,
  setUnhoveredStyle
} from '../../EnvVisualizerUtils';
import { Arrow } from '../arrows/Arrow';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this class encapsulates a JS Slang function (not from the global frame) that
 *  contains extra props such as environment and fnName */
export class FnValue extends Value implements Hoverable {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  centerX: number;
  readonly tooltipWidth: number;
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;

  /** name of this function */
  readonly fnName: string;
  readonly paramsText: string;
  readonly bodyText: string;
  readonly tooltip: string;

  /** the parent/enclosing environment of this fn value */
  readonly enclosingEnvNode: EnvTreeNode;
  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying JS Slang function (contains extra props) */
    readonly data: FnTypes,
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
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;

    this._width = this.radius * 4;
    this._height = this.radius * 2;

    this.enclosingEnvNode = Layout.environmentTree.getTreeNode(
      getNonEmptyEnv(this.data.environment) as Environment
    ) as EnvTreeNode;
    this.fnName = this.data.functionName;

    this.paramsText = `params: (${getParamsText(this.data)})`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.tooltipWidth = Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText));
  }
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
  updatePosition(): void {
    const mainReference =
      this.referencedBy.find(
        x => x instanceof Binding && (x as Binding).frame.envTreeNode === this.enclosingEnvNode
      ) || this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX;
      this._y = mainReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    this.labelRef.current.moveToTop();
    this.labelRef.current.show();
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    this.labelRef.current.hide();
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        <Group onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={Config.SA_WHITE.toString()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={Config.SA_WHITE.toString()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={Config.SA_WHITE.toString()}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={Config.SA_WHITE.toString()}
          />
        </Group>
        <KonvaLabel
          x={this.x() + this.width() + Config.TextPaddingX}
          y={this.y() - Config.TextPaddingY}
          visible={false}
          ref={this.labelRef}
        >
          <KonvaTag fill={'black'} opacity={Number(Config.FnTooltipOpacity)} />
          <KonvaText
            text={this.tooltip}
            fontFamily={Config.FontFamily.toString()}
            fontSize={Number(Config.FontSize)}
            fontStyle={Config.FontStyle.toString()}
            fill={Config.SA_WHITE.toString()}
            padding={5}
          />
        </KonvaLabel>
        {this.enclosingEnvNode.frame && Arrow.from(this).to(this.enclosingEnvNode.frame).draw()}
      </React.Fragment>
    );
  }
}
