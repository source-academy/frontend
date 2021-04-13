import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Line as KonvaLine } from 'react-konva';
import { setHoveredStyle, setUnhoveredStyle } from 'src/features/envVisualizer/EnvVisualizerUtils';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Hoverable, ReferenceType, Visible } from '../../../EnvVisualizerTypes';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit implements Visible, Hoverable {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;

  constructor(readonly referencedBy: ReferenceType[]) {
    const arrayUnit = referencedBy[0];
    this.x = arrayUnit.x;
    this.y = arrayUnit.y;
    this.height = arrayUnit.height;
    this.width = arrayUnit.width;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <KonvaLine
        key={Layout.key++}
        points={[this.x, this.y + this.height, this.x + this.width, this.y]}
        stroke={Config.SA_WHITE.toString()}
        hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      />
    );
  }
}
