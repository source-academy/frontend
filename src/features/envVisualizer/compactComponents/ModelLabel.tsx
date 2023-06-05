import { ReactNode } from 'react';
import { Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig } from '../EnvVisualizerAgendaStash';
import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
import { getTextWidth } from '../EnvVisualizerUtils';
import { defaultOptions } from './Text';

export class ModelLabel extends Visible {
  constructor(readonly text: string, posx: number) {
    super();
    this._x = posx;
    this._y = CompactConfig.CanvasPaddingY;
    this._height = AgendaStashConfig.FontSize + AgendaStashConfig.AgendaItemTextPadding * 2;
    this._width = getTextWidth(this.text);
  }

  draw(): ReactNode {
    const textProps = {
      ...defaultOptions,
      fill: AgendaStashConfig.SA_WHITE.toString(),
      fontStyle: AgendaStashConfig.FontStyleHeader.toString(),
      fontSize: Number(AgendaStashConfig.FontSizeHeader)
    };
    return (
      <Text {...ShapeDefaultProps} {...textProps} x={this.x()} y={this.y()} text={this.text} />
    );
  }
}
