import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Visible } from '../components/Visible';
import { CompactConfig, ShapeDefaultProps } from '../CseMachineCompactConfig';
import { Layout } from '../CseMachineLayout';
import { Data, IHoverable } from '../CseMachineTypes';
import { getTextWidth, setHoveredCursor, setUnhoveredCursor } from '../CseMachineUtils';

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
  fontFamily: CompactConfig.FontFamily.toString(), // default is Arial
  fontSize: Number(CompactConfig.FontSize), // in pixels. Default is 12
  fontStyle: CompactConfig.FontStyle.toString(), // can be normal, bold, or italic. Default is normal
  fontVariant: CompactConfig.FontVariant.toString(), // can be normal or small-caps. Default is normal
  isStringIdentifiable: false // if true, contain strings within double quotation marks "". Default is false
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
      let truncatedText = CompactConfig.Ellipsis.toString();
      let i = 0;
      while (
        widthOf(this.partialStr.substring(0, i) + CompactConfig.Ellipsis.toString()) < maxWidth
      ) {
        truncatedText = this.partialStr.substring(0, i++) + CompactConfig.Ellipsis.toString();
      }
      this._width = widthOf(truncatedText);
      this.partialStr = truncatedText;
    } else {
      this._width = Math.max(CompactConfig.TextMinWidth, widthOf(this.partialStr));
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
      fill: CompactConfig.SA_WHITE.toString()
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
