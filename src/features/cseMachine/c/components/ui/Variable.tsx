import React from 'react';
import { Group, Rect } from 'react-konva';

import { Visible } from '../../../components/Visible';
import { defaultTextColor } from '../../../CseMachineUtils';
import { Arrow } from '../../../java/components/Arrow';
import { CConfig, ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';
import { Text } from './Text';

export interface TextOptions {
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontVariant: string;
  isStringIdentifiable: boolean;
}

export const defaultOptions: TextOptions = {
  maxWidth: Number.MAX_VALUE, // maximum width this text should be
  fontFamily: CConfig.FontFamily.toString(), // default is Arial
  fontSize: Number(CConfig.FontSize), // in pixels. Default is 12
  fontStyle: CConfig.FontStyle.toString(), // can be normal, bold, or italic. Default is normal
  fontVariant: CConfig.FontVariant.toString(), // can be normal or small-caps. Default is normal
  isStringIdentifiable: false // if true, contain strings within double quotation marks "". Default is false
};

export class Variable extends Visible {
  private readonly _type: Text;
  private _value: Text | Arrow;

  constructor(
    x: number,
    y: number,
    private readonly _variable: number
  ) {
    super();

    // Position.
    this._x = x;
    this._y = y;

    // Type.
    this._type = new Text('INT', this._x, this._y);

    // Value.
    this._value = new Text(
      this.variable.toString(),
      this._x + CConfig.TextPaddingX,
      this._y + this._type.height() + CConfig.TextPaddingX
    );
    // if (this.variable.value.kind === 'Literal') {
    //   this._value = new Text(
    //     this.variable.value.literalType.value,
    //     this._x + Config.TextPaddingX,
    //     this._y + this._type.height() + Config.TextPaddingX
    //   );
    // } else if (this.variable.value.kind === ECE.StructType.SYMBOL) {
    //   this._value = new Text(
    //     '',
    //     this._x + Config.TextPaddingX,
    //     this._y + this._type.height() + Config.TextPaddingX
    //   );
    // } else {
    //   this._value = new Text(
    //     '',
    //     this._x + Config.TextPaddingX,
    //     this._y + this._type.height() + Config.TextPaddingX
    //   );
    // }

    // Height and width.
    this._height = this._type.height() + this._value.height() + 2 * CConfig.TextPaddingX;
    this._width = Math.max(this._type.width(), this._value.width() + 2 * CConfig.TextPaddingX);
  }

  get variable() {
    return this._variable;
  }

  set value(value: Arrow) {
    this._value = value;
    this._height = this._type.height() + CConfig.FontSize + 2 * CConfig.TextPaddingX;
    this._width = Math.max(this._type.width(), CConfig.TextMinWidth);
  }

  get type() {
    return this._type;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++}>
        {/* Type */}
        {this._type.draw()}

        {/* Box */}
        <Rect
          {...ShapeDefaultProps}
          x={this._x}
          y={this._y + this._type.height()}
          width={this._width}
          height={this._height - this._type.height()}
          stroke={defaultTextColor()}
          key={CseMachine.key++}
        />

        {/* Text */}
        {this._value.draw()}
      </Group>
    );
  }
}
