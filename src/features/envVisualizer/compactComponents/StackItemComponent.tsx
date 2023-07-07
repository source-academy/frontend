import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Label, Tag, Text } from 'react-konva';

import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { CompactConfig } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  getTextHeight,
  getTextWidth,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../EnvVisualizerUtils';
import { ArrowFromStackItemComponent } from './arrows/ArrowFromStackItemComponent';
import { Frame } from './Frame';

export class StackItemComponent extends Visible implements IHoverable {
  readonly text: string;
  readonly arrow?: ArrowFromStackItemComponent;
  readonly codeTooltip?: string;
  readonly codeLabelRef?: RefObject<any>;

  constructor(
    readonly value: any,
    readonly isAgenda: boolean,
    stackHeightWidth: number,
    arrowTo?: Frame | FnValue | GlobalFnValue,
    readonly highlightOnHover?: () => void,
    readonly unhighlightOnHover?: () => void
  ) {
    super();
    this.text = truncateText(
      String(value),
      AgendaStashConfig.AgendaMaxTextWidth,
      AgendaStashConfig.AgendaMaxTextHeight
    );
    this._width = this.isAgenda
      ? AgendaStashConfig.AgendaItemWidth
      : Math.min(
          AgendaStashConfig.AgendaItemTextPadding * 2 +
            getTextWidth(
              this.text,
              `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`
            ),
          AgendaStashConfig.AgendaItemWidth
        );
    this._height =
      (this.isAgenda
        ? getTextHeight(
            this.text,
            isAgenda ? AgendaStashConfig.AgendaMaxTextWidth : AgendaStashConfig.StashMaxTextWidth,
            `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`,
            AgendaStashConfig.FontSize
          )
        : AgendaStashConfig.StashMaxTextHeight) +
      AgendaStashConfig.AgendaItemTextPadding * 2;
    this._x = isAgenda
      ? AgendaStashConfig.AgendaPosX
      : AgendaStashConfig.StashPosX + stackHeightWidth;
    this._y = isAgenda
      ? AgendaStashConfig.AgendaPosY + stackHeightWidth
      : AgendaStashConfig.StashPosY;
    if (arrowTo) {
      this.arrow = new ArrowFromStackItemComponent(this, this.isAgenda);
      this.arrow.to(arrowTo);
    }
    if (isAgenda) {
      this.codeTooltip = this.value;
      this.codeLabelRef = React.createRef();
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    this.highlightOnHover?.();
    setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
    this.codeLabelRef?.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    this.unhighlightOnHover?.();
    setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
    this.codeLabelRef?.current.hide();
  };

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: AgendaStashConfig.SA_WHITE.toString(),
      padding: Number(AgendaStashConfig.AgendaItemTextPadding),
      fontFamily: AgendaStashConfig.FontFamily.toString(),
      fontSize: Number(AgendaStashConfig.FontSize),
      fontStyle: AgendaStashConfig.FontStyle.toString(),
      fontVariant: AgendaStashConfig.FontVariant.toString()
    };
    const tagProps = {
      stroke: EnvVisualizer.getPrintableMode()
        ? AgendaStashConfig.SA_BLUE.toString()
        : AgendaStashConfig.SA_WHITE.toString(),
      cornerRadius: Number(AgendaStashConfig.AgendaItemCornerRadius)
    };
    return (
      <React.Fragment key={Layout.key++}>
        <Label
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <Tag {...ShapeDefaultProps} {...tagProps} />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            key={Layout.key++}
            text={String(this.text)}
            width={this.width()}
            height={this.height()}
          />
        </Label>
        {this.codeLabelRef && (
          <Label
            x={this.x() + this.width() + CompactConfig.TextPaddingX * 2}
            y={this.y() - CompactConfig.TextPaddingY}
            visible={false}
            ref={this.codeLabelRef}
          >
            <Tag
              stroke="black"
              fill={'black'}
              opacity={Number(AgendaStashConfig.NodeTooltipOpacity)}
            />
            <Text
              text={this.codeTooltip}
              fontFamily={CompactConfig.FontFamily.toString()}
              fontSize={Number(CompactConfig.FontSize)}
              fontStyle={CompactConfig.FontStyle.toString()}
              fill={CompactConfig.SA_WHITE.toString()}
              padding={5}
            />
          </Label>
        )}
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
