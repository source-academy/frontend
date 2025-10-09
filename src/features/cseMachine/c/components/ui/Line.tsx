import { Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import { Visible } from '../../../components/Visible';
import { defaultStrokeColor } from '../../../CseMachineUtils';
import { CConfig, ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';

export class Line extends Visible {
  private readonly _points: number[] = [];

  constructor(fromX: number, fromY: number, toX: number, toY: number) {
    super();

    this._points.push(fromX, fromY, toX, toY);
  }

  draw(key?: number): React.ReactNode {
    const path = `M ${this._points[0]} ${this._points[1]} L ${this._points[2]} ${this._points[3]}`;
    return (
      <KonvaGroup key={CseMachine.key++}>
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={defaultStrokeColor()}
          strokeWidth={CConfig.ArrowStrokeWidth}
          hitStrokeWidth={CConfig.ArrowHitStrokeWidth}
          data={path}
          key={CseMachine.key++}
        />
      </KonvaGroup>
    );
  }
}
