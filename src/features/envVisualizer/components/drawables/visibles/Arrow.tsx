import { KonvaEventObject } from 'konva/types/Node';
import { Arrow as KonvaArrow } from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Hoverable, Visible } from '../../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../../EnvVisualizerUtils';

/** this class encapsulates an arrow to be drawn between 2 points */
export class Arrow implements Visible, Hoverable {
  readonly x: number = 0;
  readonly y: number = 0;
  readonly height: number = 0;
  readonly width: number = 0;

  constructor(readonly points: number[]) {
    if (points.length < 2) return;

    this.x = points[0];
    this.y = points[1];

    let minY = Infinity,
      maxY = 0,
      minX = Infinity,
      maxX = 0;
    points.forEach((val, idx) => {
      if (idx % 2) {
        minY = Math.min(minY, val);
        maxY = Math.max(maxY, val);
      } else {
        minX = Math.min(minX, val);
        maxX = Math.max(maxX, val);
      }
    });

    this.height = maxY - minY;
    this.width = maxX - minX;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget, {
      strokeWidth: Number(Config.ArrowHoveredStrokeWidth)
    });
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget, {
      strokeWidth: Number(Config.ArrowStrokeWidth)
    });
  };

  draw() {
    return (
      <KonvaArrow
        points={this.points}
        fill={Config.SA_WHITE.toString()}
        stroke={Config.SA_WHITE.toString()}
        strokeWidth={Number(Config.ArrowStrokeWidth)}
        hitStrokeWidth={Number(Config.ArrowHitStrokeWidth)}
        key={Layout.key++}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      />
    );
  }
}
