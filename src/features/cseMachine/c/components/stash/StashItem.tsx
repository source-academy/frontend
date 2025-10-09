import React from 'react';
import {
  Group as KonvaGroup,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import { Visible } from '../../../components/Visible';
import { defaultTextColor, getTextWidth } from '../../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';
// import { Arrow } from './Arrow';
// import { Frame } from './Frame';
// import { Method } from './Method';
// import { Variable } from './Variable';

export class StashItem extends Visible {
  //   private readonly _arrow: Arrow | undefined;

  constructor(
    x: number,
    private readonly _text: string,
    private readonly _stroke: string
    // reference?: Method | Frame | Variable
  ) {
    super();

    // Position.
    this._x = x;
    this._y = CControlStashMemoryConfig.StashPosY;

    // Height and width.
    this._height =
      CControlStashMemoryConfig.StashItemHeight +
      CControlStashMemoryConfig.StashItemTextPadding * 2;
    this._width = CControlStashMemoryConfig.StashItemTextPadding * 2 + getTextWidth(this._text);

    // Arrow
    // if (reference) {
    //   const toY =
    //     reference instanceof Frame
    //       ? reference.y() + reference.name.height()
    //       : reference instanceof Method
    //         ? reference.y()
    //         : reference.y() + reference.type.height();
    //   this._arrow = new Arrow(
    //     this._x + this._width / 2,
    //     this._y + this._height,
    //     reference.x(),
    //     toY
    //   );
    // }
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: defaultTextColor(),
      padding: CControlStashMemoryConfig.StashItemTextPadding,
      fontFamily: CControlStashMemoryConfig.FontFamily,
      fontSize: CControlStashMemoryConfig.FontSize,
      fontStyle: CControlStashMemoryConfig.FontStyle,
      fontVariant: CControlStashMemoryConfig.FontVariant
    };

    const tagProps = {
      stroke: this._stroke,
      cornerRadius: CControlStashMemoryConfig.StashItemCornerRadius
    };

    return (
      <KonvaGroup key={CseMachine.key++}>
        {/* Text */}
        <KonvaLabel x={this.x()} y={this.y()} key={CseMachine.key++}>
          <KonvaTag {...ShapeDefaultProps} {...tagProps} key={CseMachine.key++} />
          <KonvaText
            {...ShapeDefaultProps}
            {...textProps}
            text={this._text}
            key={CseMachine.key++}
          />
        </KonvaLabel>

        {/* Arrow */}
        {/* {this._arrow?.draw()} */}
      </KonvaGroup>
    );
  }
}
