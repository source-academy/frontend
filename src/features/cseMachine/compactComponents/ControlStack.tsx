import * as es from 'estree';
import { Control } from 'js-slang/dist/cse-machine/interpreter';
import { ControlItem, Instr } from 'js-slang/dist/cse-machine/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group, Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import CseMachine from '../CseMachine';
import { CompactConfig } from '../CseMachineCompactConfig';
import { ControlStashConfig } from '../CseMachineControlStash';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import {
  defaultSAColor,
  getControlItemComponent,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../CseMachineUtils';
import { ControlItemComponent } from './ControlItemComponent';

export class ControlStack extends Visible implements IHoverable {
  /** array of control item components */
  readonly stackItemComponents: ControlItemComponent[];

  constructor(
    /** the control object */
    readonly control: Control
  ) {
    super();
    this._x = ControlStashConfig.ControlPosX;
    this._y = ControlStashConfig.ControlPosY;
    this._width = ControlStashConfig.ControlItemWidth;
    this._height = ControlStashConfig.StashItemHeight + ControlStashConfig.StashItemTextPadding * 2;
    this.control = control;

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
        unhighlightOnHover
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

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: 12,
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {CseMachine.getStackTruncated() && Layout.control.size() > 10 && (
          <Label
            x={Number(ControlStashConfig.ShowMoreButtonX)}
            y={Number(ControlStashConfig.ShowMoreButtonY)}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onMouseUp={() => {
              CseMachine.toggleStackTruncated();
              CseMachine.redraw();
            }}
          >
            <Tag
              stroke={defaultSAColor()}
              cornerRadius={Number(ControlStashConfig.ControlItemCornerRadius)}
            />
            <Text
              {...textProps}
              text={`${CompactConfig.Ellipsis}`}
              align="center"
              fill={defaultSAColor()}
              width={Number(ControlStashConfig.ShowMoreButtonWidth)}
              height={Number(ControlStashConfig.ShowMoreButtonHeight)}
            />
          </Label>
        )}
        {this.stackItemComponents.map(c => c?.draw())}
      </Group>
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
export const isNode = (command: ControlItem): command is es.Node => {
  return (command as es.Node).type !== undefined;
};
