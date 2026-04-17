import { Label } from 'konva/lib/shapes/Label';
import React, { RefObject } from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config } from '../../CseMachineConfig';
import { Data, ReferenceType } from '../../CseMachineTypes';
import { defaultBackgroundColor, isDummyReference } from '../../CseMachineUtils';
import { Visible } from '../Visible';

type FunctionTooltipLabelsProps = {
  x: number;
  y: number;
  radius: number;
  printDescriptionOffsetY: number;
  isTooltipTruncated: boolean;
  exportTooltip: string;
  tooltip: string;
  strokeColor: string;
  textColor: string;
  labelRef: RefObject<Label | null>;
  revealLabelRef: RefObject<Label | null>;
};

export const FunctionTooltipLabels = ({
  x,
  y,
  radius,
  printDescriptionOffsetY,
  isTooltipTruncated,
  exportTooltip,
  tooltip,
  strokeColor,
  textColor,
  labelRef,
  revealLabelRef
}: FunctionTooltipLabelsProps): React.ReactNode => (
  <React.Fragment>
    <KonvaLabel
      x={x + Config.TextMargin}
      y={y + radius + Config.TextMargin + printDescriptionOffsetY}
      visible={CseMachine.getPrintableMode()}
      listening={false}
      ref={labelRef}
    >
      <KonvaTag
        stroke={strokeColor}
        fill={defaultBackgroundColor()}
        cornerRadius={Config.FrameCornerRadius}
      />
      <KonvaText
        text={
          !CseMachine.getPrintableMode() && isTooltipTruncated
            ? `${exportTooltip}\n(click for full)`
            : exportTooltip
        }
        fontFamily={Config.FontFamily}
        fontSize={Config.FontSize}
        fontStyle={Config.FontStyle}
        fill={textColor}
        padding={Config.FnTooltipTextPadding}
        width={Config.FnDescriptionMaxWidth}
      />
    </KonvaLabel>
    {!CseMachine.getPrintableMode() && isTooltipTruncated && (
      <KonvaLabel
        x={x + Config.TextMargin}
        y={y + radius + Config.TextMargin}
        visible={false}
        listening={false}
        ref={revealLabelRef}
      >
        <KonvaTag
          stroke={strokeColor}
          fill={defaultBackgroundColor()}
          cornerRadius={Config.FrameCornerRadius}
        />
        <KonvaText
          text={tooltip}
          fontFamily={Config.FontFamily}
          fontSize={Config.FontSize}
          fontStyle={Config.FontStyle}
          fill={textColor}
          padding={Config.FnTooltipTextPadding}
        />
      </KonvaLabel>
    )}
  </React.Fragment>
);

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible {
  /** the underlying data of this value */
  abstract readonly data: Data;

  /**
   * if the value has actual references, i.e. the references
   * are not from dummy bindings or from unreferenced arrays
   */
  private _isReferenced: boolean = false;

  isReferenced() {
    return this._isReferenced;
  }

  markAsReferenced() {
    this._isReferenced = true;
  }

  /** references to this value */
  public references: ReferenceType[] = [];

  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.references.push(newReference);
    this.handleNewReference(newReference);
    if (!this.isReferenced() && !isDummyReference(newReference)) {
      this.markAsReferenced();
    }
  }

  /** additional logic to handle new references */
  abstract handleNewReference(newReference: ReferenceType): void;

  /** draw logic */
  abstract draw(): React.ReactNode;

  abstract isLive(): boolean;
}
