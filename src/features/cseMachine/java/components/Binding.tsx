import { ECE } from 'java-slang';
import React from 'react';

import { Visible } from '../../components/Visible';
import { Config } from '../../CseMachineConfig';
import { CseMachine } from '../CseMachine';
import { Arrow } from './Arrow';
import { Method } from './Method';
import { Text } from './Text';
import { Variable } from './Variable';

/** a Binding is a key-value pair in a Frame */
export class Binding extends Visible {
  private readonly _name: Text;

  private readonly _value: Variable | Method | Text;
  // Only Method has arrow.
  private readonly _arrow: Arrow | undefined;

  constructor(name: ECE.Name, value: ECE.Value, x: number, y: number) {
    super();

    // Position.
    this._x = x;
    this._y = y;

    if (value.kind === ECE.StructType.CLOSURE) {
      // Name.
      this._name = new Text(
        name + Config.VariableColon, // := is part of name
        this.x(),
        this.y()
      );
      // Value.
      this._value = new Method(
        this._name.x() + this._name.width(),
        this.y() + this._name.height() / 2,
        value
      );
      this._arrow = new Arrow(
        this._name.x() + this._name.width(),
        this._name.y() + this._name.height() / 2,
        this._value.x(),
        this._value.y()
      );
    } else if (value.kind === ECE.StructType.VARIABLE) {
      // Name.
      this._name = new Text(
        name + Config.VariableColon, // := is part of name
        this.x(),
        this.y() + Config.FontSize + Config.TextPaddingX
      );
      // Value.
      this._value = new Variable(this._name.x() + this._name.width(), this.y(), value);
    } /*if (value.kind === StructType.CLASS)*/ else {
      // Dummy value as class will nvr be drawn.
      // Name.
      this._name = new Text(
        name + Config.VariableColon, // := is part of name
        this.x(),
        this.y() + Config.FontSize + Config.TextPaddingX
      );
      // Value.
      this._value = new Text(
        '',
        this._name.x() + this._name.width() + Config.TextPaddingX,
        this.y() + Config.TextPaddingX
      );
    }

    // Height and width.
    this._height = Math.max(this._name.height(), this._value.height());
    this._width = this._value.x() + this._value.width() - this._name.x();
  }

  get value() {
    return this._value;
  }

  setArrowToX(x: number) {
    this._arrow?.setToX(x);
  }

  draw(): React.ReactNode {
    return (
      <React.Fragment key={CseMachine.key++}>
        {/* Name */}
        {this._name.draw()}

        {/* Value */}
        {this._value.draw()}
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
