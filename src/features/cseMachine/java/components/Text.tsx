import React from 'react';
import { Group as KonvaGroup, Label as KonvaLabel, Text as KonvaText } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { defaultTextColor, getTextWidth } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';

/** this class encapsulates a string to be drawn onto the canvas */
export class Text extends Visible {
  constructor(
    private readonly _text: string,
    x: number,
    y: number
  ) {
    super();

    // Position
    this._x = x;
    this._y = y;

    // Height and width
    this._height = Config.FontSize;
    this._width = getTextWidth(this._text);
  }

  get text() {
    return this._text;
  }

  setY(y: number) {
    this._y = y;
  }

  draw(): React.ReactNode {
    const props = {
      fontFamily: Config.FontFamily,
      fontSize: Config.FontSize,
      fontStyle: Config.FontStyle,
      fill: defaultTextColor()
    };

    return (
      <KonvaGroup key={CseMachine.key++}>
        <KonvaLabel x={this.x()} y={this.y()} key={CseMachine.key++}>
          <KonvaText {...ShapeDefaultProps} key={CseMachine.key++} text={this._text} {...props} />
        </KonvaLabel>
      </KonvaGroup>
    );
  }
}
