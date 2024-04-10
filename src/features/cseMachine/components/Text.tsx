import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Data, IHoverable } from '../CseMachineTypes';
import {
  defaultSAColor,
  fadedSAColor,
  getTextWidth,
  setHoveredCursor,
  setUnhoveredCursor
} from '../CseMachineUtils';
import { Visible } from './Visible';

export interface TextOptions {
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontVariant: string;
  isStringIdentifiable: boolean;
  faded: boolean;
}

export const defaultOptions: TextOptions = {
  maxWidth: Number.MAX_VALUE, // maximum width this text should be
  fontFamily: Config.FontFamily, // default is Arial
  fontSize: Config.FontSize, // in pixels. Default is 12
  fontStyle: Config.FontStyle, // can be normal, bold, or italic. Default is normal
  fontVariant: Config.FontVariant, // can be normal or small-caps. Default is normal
  isStringIdentifiable: false, // if true, contain strings within double quotation marks "". Default is false
  faded: false // if true, draws text with a lighter shade
};

/** this class encapsulates a string to be drawn onto the canvas */
export class Text extends Visible implements IHoverable {
  readonly _height: number;
  readonly _width: number;

  readonly partialStr: string; // truncated string representation of data
  readonly fullStr: string; // full string representation of data

  readonly options: TextOptions = defaultOptions;

  constructor(
    readonly data: Data,
    readonly _x: number,
    readonly _y: number,
    /** additional options (for customization of text) */
    options: Partial<TextOptions> = {}
  ) {
    super();
    this.options = { ...this.options, ...options };

    const { fontSize, fontStyle, fontFamily, maxWidth, isStringIdentifiable } = this.options;

    this.fullStr = this.partialStr = isStringIdentifiable
      ? JSON.stringify(data) || String(data)
      : String(data);
    this._height = fontSize;
    const widthOf = (s: string) => getTextWidth(s, `${fontStyle} ${fontSize}px ${fontFamily}`);
    if (widthOf(this.partialStr) > maxWidth) {
      let truncatedText: string = Config.Ellipsis;
      let i = 0;
      while (widthOf(this.partialStr.substring(0, i) + Config.Ellipsis) < maxWidth) {
        truncatedText = this.partialStr.substring(0, i++) + Config.Ellipsis;
      }
      this._width = widthOf(truncatedText);
      this.partialStr = truncatedText;
    } else {
      this._width = Math.max(Config.TextMinWidth, widthOf(this.partialStr));
    }
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredCursor(currentTarget);
    this.ref.current.moveToTop();
    this.ref.current.show();
    currentTarget.getLayer()?.draw();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredCursor(currentTarget);
    this.ref.current.hide();
    currentTarget.getLayer()?.draw();
  };

  draw(): React.ReactNode {
    const props = {
      fontFamily: this.options.fontFamily,
      fontSize: this.options.fontSize,
      fontStyle: this.options.fontStyle,
      fill: this.options.faded ? fadedSAColor() : defaultSAColor()
    };
    return (
      <React.Fragment key={Layout.key++}>
        <KonvaLabel
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.partialStr} {...props} />
        </KonvaLabel>
        <KonvaLabel
          x={this.x()}
          y={this.y()}
          ref={this.ref}
          visible={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaTag {...ShapeDefaultProps} fill={'black'} opacity={0.5} />
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.fullStr} {...props} />
        </KonvaLabel>
      </React.Fragment>
    );
  }
}
