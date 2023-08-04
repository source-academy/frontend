import * as es from 'estree';
import { Agenda } from 'js-slang/dist/ec-evaluator/interpreter';
import { AgendaItem, Instr } from 'js-slang/dist/ec-evaluator/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group, Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig } from '../EnvVisualizerAgendaStash';
import { CompactConfig } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  defaultSAColor,
  getAgendaItemComponent,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../EnvVisualizerUtils';
import { AgendaItemComponent } from './AgendaItemComponent';

export class AgendaStack extends Visible implements IHoverable {
  /** array of agenda item components */
  readonly stackItemComponents: AgendaItemComponent[];

  constructor(
    /** the agenda object */
    readonly agenda: Agenda
  ) {
    super();
    this._x = AgendaStashConfig.AgendaPosX;
    this._y = AgendaStashConfig.AgendaPosY;
    this._width = AgendaStashConfig.AgendaItemWidth;
    this._height = AgendaStashConfig.StashItemHeight + AgendaStashConfig.StashItemTextPadding * 2;
    this.agenda = agenda;

    // Function to convert the stack items to their components
    let i = 0;
    const agendaItemToComponent = (agendaItem: AgendaItem) => {
      const node = isNode(agendaItem) ? agendaItem : agendaItem.srcNode;
      let highlightOnHover = () => {};
      let unhighlightOnHover = () => {};

      highlightOnHover = () => {
        if (node.loc) {
          const start = node.loc.start.line - 1;
          const end = node.loc.end.line - 1;
          EnvVisualizer.setEditorHighlightedLines([[start, end]]);
        }
      };
      unhighlightOnHover = () => EnvVisualizer.setEditorHighlightedLines([]);
      const component = getAgendaItemComponent(
        agendaItem,
        this._height,
        i,
        highlightOnHover,
        unhighlightOnHover
      );
      this._height += component.height();
      i += 1;

      return component;
    };

    this.stackItemComponents = this.agenda
      .getStack()
      .slice(EnvVisualizer.getStackTruncated() ? -10 : 0)
      .map(agendaItemToComponent);
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
      fontFamily: AgendaStashConfig.FontFamily.toString(),
      fontSize: 12,
      fontStyle: AgendaStashConfig.FontStyle.toString(),
      fontVariant: AgendaStashConfig.FontVariant.toString()
    };
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {EnvVisualizer.getStackTruncated() && Layout.agenda.size() > 10 && (
          <Label
            x={Number(AgendaStashConfig.ShowMoreButtonX)}
            y={Number(AgendaStashConfig.ShowMoreButtonY)}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onMouseUp={() => {
              EnvVisualizer.toggleStackTruncated();
              EnvVisualizer.redraw();
            }}
          >
            <Tag
              stroke={defaultSAColor()}
              cornerRadius={Number(AgendaStashConfig.AgendaItemCornerRadius)}
            />
            <Text
              {...textProps}
              text={`${CompactConfig.Ellipsis}`}
              align="center"
              fill={defaultSAColor()}
              width={Number(AgendaStashConfig.ShowMoreButtonWidth)}
              height={Number(AgendaStashConfig.ShowMoreButtonHeight)}
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
 * @param command An AgendaItem
 * @returns true if the AgendaItem is an instruction and false otherwise.
 */
export const isInstr = (command: AgendaItem): command is Instr => {
  return (command as Instr).instrType !== undefined;
};

/**
 * Typeguard for esNode to distinguish between program statements and instructions.
 * The typeguard from js-slang cannot be used due to Typescript raising some weird errors
 * with circular dependencies so it is redefined here.
 *
 * @param command An AgendaItem
 * @returns true if the AgendaItem is an esNode and false if it is an instruction.
 */
export const isNode = (command: AgendaItem): command is es.Node => {
  return (command as es.Node).type !== undefined;
};
