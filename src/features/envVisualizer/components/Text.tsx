import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Hoverable, Visible } from '../EnvVisualizerTypes';
import { getTextWidth } from '../EnvVisualizerUtils';

export interface TextOptions {
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontVariant: string;
  isStringIdentifiable: boolean;
}

export const defaultOptions: TextOptions = {
  maxWidth: Number.MAX_VALUE, // maximum width this text should be
  fontFamily: Config.FontFamily.toString(), // default is Arial
  fontSize: Number(Config.FontSize), // in pixels. Default is 12
  fontStyle: Config.FontStyle.toString(), // can be normal, bold, or italic. Default is normal
  fontVariant: Config.FontVariant.toString(), // can be normal or small-caps. Default is normal
  isStringIdentifiable: false // if true, contain strings within double quotation marks "". Default is false
};

/** this class encapsulates a string to be drawn onto the canvas */
export class Text implements Visible, Hoverable {
  private _height: number;
  private _width: number;
  private _hoveredWidth: number;

  readonly partialStr: string; // truncated string representation of data
  readonly fullStr: string; // full string representation of data

  readonly options: TextOptions = defaultOptions;
  ref: RefObject<any> = React.createRef();
  private _x: number;
  private _y: number;

  constructor(
    readonly data: Data,
    x: number,
    y: number,
    /** additional options (for customization of text) */
    options: Partial<TextOptions> = {}
  ) {
    this._x = x;
    this._y = y;
    this.options = { ...this.options, ...options };

    const { fontSize, fontStyle, fontFamily, maxWidth, isStringIdentifiable } = this.options;

    this.fullStr = this.partialStr = isStringIdentifiable
      ? JSON.stringify(data) || String(data)
      : String(data);
    this._height = fontSize;

    const widthOf = (s: string) => getTextWidth(s, `${fontStyle} ${fontSize}px ${fontFamily}`);
    this._hoveredWidth = widthOf(this.partialStr);
    if (this._hoveredWidth > maxWidth) {
      let truncatedText = Config.Ellipsis.toString();
      let i = 0;
      while (widthOf(this.partialStr.substr(0, i) + Config.Ellipsis.toString()) < maxWidth) {
        truncatedText = this.partialStr.substr(0, i++) + Config.Ellipsis.toString();
      }
      this._width = widthOf(truncatedText);
      this.partialStr = truncatedText;
    } else {
      this._width = Math.max(Config.TextMinWidth, widthOf(this.partialStr));
    }
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }
  hoveredWidth(): number {
    return this._hoveredWidth;
  }
  updatePosition = (x: number, y: number) => {
    this._x = x;
    this._y = y;
  };

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (EnvVisualizer.getPrintableMode()) return;
    const container = currentTarget.getStage()?.container();
    container && (container.style.cursor = 'pointer');
    this.ref.current.moveToTop();
    this.ref.current.show();
    currentTarget.getLayer()?.draw();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (EnvVisualizer.getPrintableMode()) return;
    const container = currentTarget.getStage()?.container();
    container && (container.style.cursor = 'default');
    this.ref.current.hide();
    currentTarget.getLayer()?.draw();
  };

  draw(): React.ReactNode {
    const props = {
      fontFamily: this.options.fontFamily,
      fontSize: this.options.fontSize,
      fontStyle: this.options.fontStyle,
      fill: EnvVisualizer.getPrintableMode()
        ? Config.SA_BLUE.toString()
        : Config.SA_WHITE.toString()
    };
    return (
      <Group key={Layout.key++}>
        <KonvaLabel
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.partialStr} {...props} />
        </KonvaLabel>
        <KonvaLabel
          x={this._x}
          y={this._y}
          ref={this.ref}
          visible={EnvVisualizer.getPrintableMode() ? true : false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaTag
            {...ShapeDefaultProps}
            fill={EnvVisualizer.getPrintableMode() ? 'white' : 'black'}
            opacity={0.5}
          />
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.fullStr} {...props} />
        </KonvaLabel>
      </Group>
    );
  }
}
