import React from 'react';

import { Visible } from '../../components/Visible';
import { Arrow } from '../../java/components/Arrow';
import { Method } from '../../java/components/Method';
import { CConfig } from '../config/CCSEMachineConfig';
import { CseMachine } from '../CseMachine';
import { Text } from './Text';
import { Variable } from './Variable';

/** a Binding is a key-value pair in a Frame */
export class Binding extends Visible {
  private readonly _name: Text;

  private readonly _value: Variable | Method | Text;
  // Only Method has arrow.
  private readonly _arrow: Arrow | undefined;

  constructor(name: string, value: number, x: number, y: number) {
    super();

    // Position.
    this._x = x;
    this._y = y;

      // Name.
    this._name = new Text(
      name + CConfig.VariableColon, // := is part of name
      this.x(),
      this.y() + CConfig.FontSize + CConfig.TextPaddingX
    );
    // Value.
    this._value = new Variable(this._name.x() + this._name.width(), this.y(), value);

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
