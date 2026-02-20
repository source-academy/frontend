import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IVisible } from '../../CseMachineTypes';
import { defaultStrokeColor, fadedStrokeColor } from '../../CseMachineUtils';
import { GenericArrow } from './GenericArrow';

export class DottedArrow extends GenericArrow<IVisible, IVisible> {
    draw() {
    const stroke = this.faded ? fadedStrokeColor() : defaultStrokeColor();
    return (
      <KonvaGroup key={Layout.key++} ref={this.ref} listening={false}>
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={stroke}
          strokeWidth={Config.ArrowStrokeWidth}
          data={this.path()}
          key={Layout.key++}
          dash={[10, 5]}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={this.points.slice(this.points.length - 4)}
          fill={stroke}
          strokeEnabled={false}
          pointerWidth={Config.ArrowHeadSize}
          key={Layout.key++}
        />
      </KonvaGroup>
    );
  }
}
