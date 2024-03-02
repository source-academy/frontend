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

import CseMachine from '../../CseMachine';
import { CompactConfig, ShapeDefaultProps } from '../../CseMachineCompactConfig';
import { Layout } from '../../CseMachineLayout';
import { CompactReferenceType, EnvTreeNode, FnTypes, IHoverable } from '../../CseMachineTypes';
import {
  defaultSAColor,
  getBodyText,
  getNonEmptyEnv,
  getParamsText,
  getTextWidth
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this class encapsulates a JS Slang function (not from the global frame) that
 *  contains extra props such as environment and fnName */
export class FnValue extends Value implements IHoverable {
  /** name of this function */
  readonly radius: number = CompactConfig.FnRadius;
  readonly innerRadius: number = CompactConfig.FnInnerRadius;
  readonly tooltipWidth: number;
  readonly centerX: number;

  readonly fnName: string;
  readonly paramsText: string;
  readonly bodyText: string;
  readonly exportBodyText: string;
  readonly tooltip: string;
  readonly exportTooltip: string;
  readonly exportTooltipWidth: number;
  private _arrow: ArrowFromFn | undefined;

  /** the parent/enclosing environment of this fn value */
  readonly enclosingEnvNode: EnvTreeNode;
  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying JS Slang function (contains extra props) */
    readonly data: FnTypes,
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

    this.enclosingEnvNode = Layout.environmentTree.getTreeNode(
      getNonEmptyEnv(this.data.environment) as Environment
    ) as EnvTreeNode;
    this.fnName = this.data.functionName;

    this.paramsText = `params: (${getParamsText(this.data)})`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
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
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.ref.current.moveToTop();
    this.labelRef.current.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.labelRef.current.hide();
  };
  updatePosition(): void {}
  draw(): React.ReactNode {
    this._arrow =
      this.enclosingEnvNode.compactFrame &&
      (new ArrowFromFn(this).to(this.enclosingEnvNode.compactFrame) as ArrowFromFn);
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
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
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
