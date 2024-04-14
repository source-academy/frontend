import { ECE } from 'java-slang';
import React from 'react';
import { Group, Rect } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { defaultTextColor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { Arrow } from './Arrow';
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
  fontFamily: Config.FontFamily.toString(), // default is Arial
  fontSize: Number(Config.FontSize), // in pixels. Default is 12
  fontStyle: Config.FontStyle.toString(), // can be normal, bold, or italic. Default is normal
  fontVariant: Config.FontVariant.toString(), // can be normal or small-caps. Default is normal
  isStringIdentifiable: false // if true, contain strings within double quotation marks "". Default is false
};

export class Variable extends Visible {
  private readonly _type: Text;
  private _value: Text | Arrow;

  constructor(
    x: number,
    y: number,
    private readonly _variable: ECE.Variable
  ) {
    super();

    // Position.
    this._x = x;
    this._y = y;

    // Type.
    this._type = new Text(this._variable.type, this._x, this._y);

    // Value.
    if (this.variable.value.kind === 'Literal') {
      this._value = new Text(
        this.variable.value.literalType.value,
        this._x + Config.TextPaddingX,
        this._y + this._type.height() + Config.TextPaddingX
      );
    } else if (this.variable.value.kind === ECE.StructType.SYMBOL) {
      this._value = new Text(
        '',
        this._x + Config.TextPaddingX,
        this._y + this._type.height() + Config.TextPaddingX
      );
    } else {
      this._value = new Text(
        '',
        this._x + Config.TextPaddingX,
        this._y + this._type.height() + Config.TextPaddingX
      );
    }

    // Height and width.
    this._height = this._type.height() + this._value.height() + 2 * Config.TextPaddingX;
    this._width = Math.max(this._type.width(), this._value.width() + 2 * Config.TextPaddingX);
  }

  get variable() {
    return this._variable;
  }

  set value(value: Arrow) {
    this._value = value;
    this._height = this._type.height() + Config.FontSize + 2 * Config.TextPaddingX;
    this._width = Math.max(this._type.width(), Config.TextMinWidth);
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
