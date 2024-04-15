import { Control } from 'js-slang/dist/cse-machine/interpreter';
import { ControlItem, Instr } from 'js-slang/dist/cse-machine/types';
import { Chapter, StatementSequence } from 'js-slang/dist/types';
import { Node } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import {
  defaultStrokeColor,
  defaultTextColor,
  getControlItemComponent,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../CseMachineUtils';
import { ControlItemComponent } from './ControlItemComponent';
import { Visible } from './Visible';

export class ControlStack extends Visible implements IHoverable {
  /** array of control item components */
  readonly stackItemComponents: ControlItemComponent[];

  constructor(
    /** the control object */
    readonly control: Control,
    readonly chapter: Chapter
  ) {
    super();
    this._x = ControlStashConfig.ControlPosX;
    this._y = ControlStashConfig.ControlPosY;
    this._width = ControlStashConfig.ControlItemWidth;
    this._height = ControlStashConfig.StashItemHeight + ControlStashConfig.StashItemTextPadding * 2;
    this.control = control;
    this.chapter = chapter;

    // Function to convert the stack items to their components
    let i = 0;
    const controlItemToComponent = (controlItem: ControlItem) => {
      const node = isNode(controlItem) ? controlItem : controlItem.srcNode;
      let highlightOnHover = () => {};
      let unhighlightOnHover = () => {};

      highlightOnHover = () => {
        if (node.loc) {
          const start = node.loc.start.line - 1;
          const end = node.loc.end.line - 1;
          CseMachine.setEditorHighlightedLines([[start, end]]);
        }
      };
      unhighlightOnHover = () => CseMachine.setEditorHighlightedLines([]);
      const component = getControlItemComponent(
        controlItem,
        this._height,
        i,
        highlightOnHover,
        unhighlightOnHover,
        this.chapter
      );
      this._height += component.height();
      i += 1;

      return component;
    };

    this.stackItemComponents = this.control
      .getStack()
      .slice(CseMachine.getStackTruncated() ? -10 : 0)
      .map(controlItemToComponent);
  }

  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {
    setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
  }

  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {
    setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
  }

  draw(): React.ReactNode {
    const textProps = {
      fontFamily: ControlStashConfig.FontFamily,
      fontSize: 12,
      fontStyle: ControlStashConfig.FontStyle,
      fontVariant: ControlStashConfig.FontVariant
    };
    return (
      <>
        {CseMachine.getStackTruncated() && Layout.control.size() > 10 && (
          <Label
            x={ControlStashConfig.ShowMoreButtonX}
            y={ControlStashConfig.ShowMoreButtonY}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onMouseUp={() => {
              CseMachine.toggleStackTruncated();
              CseMachine.redraw();
            }}
          >
            <Tag
              stroke={defaultStrokeColor()}
              cornerRadius={ControlStashConfig.ControlItemCornerRadius}
            />
            <Text
              {...textProps}
              text={`${Config.Ellipsis}`}
              align="center"
              fill={defaultTextColor()}
              width={ControlStashConfig.ShowMoreButtonWidth}
              height={ControlStashConfig.ShowMoreButtonHeight}
            />
          </Label>
        )}
        {this.stackItemComponents.map(c => c?.draw())}
      </>
    );
  }
}

/**
 * Typeguard for Instr to distinguish between program statements and instructions.
 * The typeguard from js-slang cannot be used due to Typescript raising some weird errors
 * with circular dependencies so it is redefined here.
 *
 * @param command A ControlItem
 * @returns true if the ControlItem is an instruction and false otherwise.
 */
export const isInstr = (command: ControlItem): command is Instr => {
  return (command as Instr).instrType !== undefined;
};

/**
 * Typeguard for esNode to distinguish between program statements and instructions.
 * The typeguard from js-slang cannot be used due to Typescript raising some weird errors
 * with circular dependencies so it is redefined here.
 *
 * @param command A ControlItem
 * @returns true if the ControlItem is an esNode and false if it is an instruction.
 */
export const isNode = (command: ControlItem): command is Node | StatementSequence => {
  return (command as Node).type !== undefined;
};
