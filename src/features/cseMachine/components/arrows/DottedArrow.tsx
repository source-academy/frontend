import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IVisible } from '../../CseMachineTypes';
import { GenericArrow } from './GenericArrow';

export class DottedArrow extends GenericArrow<IVisible, IVisible> {
  draw() {
    const stroke = CseMachine.getPrintableMode() ? '#9B870C' : '#ded74e';
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
