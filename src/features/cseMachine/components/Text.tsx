import { KonvaEventObject } from 'konva/lib/Node';
import { Label } from 'konva/lib/shapes/Label';
import React from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Data, IHoverable } from '../CseMachineTypes';
import {
  defaultTextColor,
  fadedTextColor,
  getTextWidth,
  isSourceObject,
  setHoveredCursor,
  setUnhoveredCursor
} from '../CseMachineUtils';
import { isCustomPrimitive } from '../utils/altLangs';
import { Visible } from './Visible';

export interface TextOptions {
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontVariant: string;
  isStringIdentifiable: boolean;
  faded: boolean;
  hidden: boolean;
}

export const defaultOptions: TextOptions = {
  maxWidth: Number.MAX_VALUE, // maximum width this text should be
  fontFamily: Config.FontFamily, // default is Arial
  fontSize: Config.FontSize, // in pixels. Default is 12
  fontStyle: Config.FontStyle, // can be normal, bold, or italic. Default is normal
  fontVariant: Config.FontVariant, // can be normal or small-caps. Default is normal
  isStringIdentifiable: false, // if true, contain strings within double quotation marks "". Default is false
  faded: false, // if true, draws text with a lighter shade
  hidden: false // if true, hides the text when only when first drawn
};

/** this class encapsulates a string to be drawn onto the canvas */
export class Text extends Visible implements IHoverable {
  readonly _height: number;
  readonly _width: number;

  readonly partialStr: string; // truncated string representation of data
  readonly fullStr: string; // full string representation of data

  readonly options: TextOptions = defaultOptions;
  readonly labelRef: React.RefObject<Label> = React.createRef();

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

    this.fullStr = this.partialStr = isSourceObject(data)
      ? data.toReplString()
      : isCustomPrimitive(data)
        ? String(data)
        : isStringIdentifiable
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
    this.labelRef.current?.moveToTop();
    this.labelRef.current?.show();
    currentTarget.getLayer()?.draw();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredCursor(currentTarget);
    this.labelRef.current?.hide();
    currentTarget.getLayer()?.draw();
  };

  draw(): React.ReactNode {
    const props = {
      fontFamily: this.options.fontFamily,
      fontSize: this.options.fontSize,
      fontStyle: this.options.fontStyle,
      fill: this.options.faded ? fadedTextColor() : defaultTextColor(),
      visible: !this.options.hidden
    };
    return (
      <React.Fragment key={Layout.key++}>
        <KonvaLabel
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaText
            {...ShapeDefaultProps}
            key={Layout.key++}
            ref={this.ref}
            text={this.partialStr}
            {...props}
          />
        </KonvaLabel>
        <KonvaLabel
          x={this.x()}
          y={this.y()}
          ref={this.labelRef}
          visible={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaTag
            {...ShapeDefaultProps}
            fill={CseMachine.getPrintableMode() ? Config.PrintHoverBgColor : Config.HoverBgColor}
            opacity={0.5}
          />
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.fullStr} {...props} />
        </KonvaLabel>
      </React.Fragment>
    );
  }
}
