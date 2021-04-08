import { KonvaEventObject } from 'konva/types/Node';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Env, FnTypes, Hoverable, ReferenceType } from '../../../EnvVisualizerTypes';
import { getTextWidth, setHoveredStyle, setUnhoveredStyle } from '../../../EnvVisualizerUtils';
import { Arrow } from '../../Arrow';
import { Frame } from '../../Frame';
import { Binding } from '../Binding';
import { Value } from '../Value';

/** this class encapsulates a JS Slang function (not from the global frame) that
 *  contains extra props such as environment and fnName */
export class FnValue extends Value implements Hoverable {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;

  /** the parent/enclosing environment of this fn value */
  readonly enclosingEnv: Env;

  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;
  readonly centerX: number;

  readonly fnName: string;
  readonly paramsText: string;
  readonly bodyText: string;
  readonly textDescription: string;
  readonly textDescriptionWidth: number;
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
      this.x = mainReference.frame.x + mainReference.frame.width + Config.FrameMarginX;
      this.y = mainReference.y;
      this.centerX = this.x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this.x = mainReference.x + Config.DataUnitWidth * 2;
        this.y = mainReference.y + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this.x = mainReference.x;
        this.y = mainReference.y + mainReference.parent.height + Config.DataUnitHeight;
      }
      this.centerX = this.x + Config.DataUnitWidth / 2;
      this.x = this.centerX - this.radius * 2;
    }
    this.y += this.radius;

    this.width = this.radius * 4;
    this.height = this.radius * 2;

    this.enclosingEnv = this.data.environment;
    this.fnName = this.data.functionName;

    const fnString = this.data.toString();
    const params = this.data.node.params.map((node: any) => node.name).join(',');
    let body =
      this.data.node.type === 'FunctionDeclaration' || fnString.substring(0, 8) === 'function'
        ? fnString.substring(fnString.indexOf('{'))
        : fnString.substring(fnString.indexOf('=') + 3);

    if (body[0] !== '{') body = '{\n  return ' + body + ';\n}';

    this.paramsText = `params: (${params})`;
    this.bodyText = `body: ${body}`;
    this.textDescription = `${this.paramsText}\n${this.bodyText}`;
    this.textDescriptionWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.bodyText)
    );
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    this.labelRef.current.show();
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    this.labelRef.current.hide();
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    let arrowPoints: number[] = [];
    if (this.enclosingEnv.frame) {
      const to: Frame = this.enclosingEnv.frame;

      if (to.y < this.y && this.y < to.y + to.height) {
        arrowPoints = [
          this.x + Config.FnRadius * 3,
          this.y,
          this.x + Config.FnRadius * 3,
          this.y - Config.FnRadius * 2,
          to.x + to.width,
          this.y - Config.FnRadius * 2
        ];
      } else if (to.y < this.y) {
        arrowPoints = [this.x + Config.FnRadius * 3, this.y, to.x + to.width / 2, to.y + to.height];
      } else {
        arrowPoints = [this.x + Config.FnRadius * 3, this.y, to.x + to.width / 2, to.y];
      }
    }

    return (
      <React.Fragment key={Layout.key++}>
        <Group onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <Circle
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y}
            radius={this.radius}
            stroke={Config.SA_WHITE.toString()}
          />
          <Circle
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y}
            radius={this.innerRadius}
            fill={Config.SA_WHITE.toString()}
          />
          <Circle
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y}
            radius={this.radius}
            stroke={Config.SA_WHITE.toString()}
          />
          <Circle
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y}
            radius={this.innerRadius}
            fill={Config.SA_WHITE.toString()}
          />
        </Group>
        <KonvaLabel
          x={this.x + this.width + Config.TextPaddingX}
          y={this.y - Config.TextPaddingY}
          visible={false}
          ref={this.labelRef}
        >
          <KonvaTag fill={'black'} opacity={0.25} />
          <KonvaText
            text={this.textDescription}
            fontFamily={Config.FontFamily.toString()}
            fontSize={Number(Config.FontSize)}
            fontStyle={Config.FontStyle.toString()}
            fill={Config.SA_WHITE.toString()}
            padding={5}
          />
        </KonvaLabel>
        {arrowPoints && new Arrow(arrowPoints).draw()}
      </React.Fragment>
    );
  }
}
