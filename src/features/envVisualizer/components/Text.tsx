import { KonvaEventObject } from 'konva/types/Node';
import React, { RefObject } from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Hoverable, Visible } from '../EnvVisualizerTypes';
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
  readonly height: number;
  readonly width: number;

  readonly fullStr: string;

  readonly options: TextOptions = defaultOptions;
  private labelRef: RefObject<any> = React.createRef();

  constructor(
    /** text */
    readonly data: any,
    readonly x: number,
    readonly y: number,
    /** additional options (for customization of text) */
    options: Partial<TextOptions> = {}
  ) {
    this.options = { ...this.options, ...options };

    const { fontSize, fontStyle, fontFamily, maxWidth, isStringIdentifiable } = this.options;

    this.fullStr = this.data = isStringIdentifiable ? JSON.stringify(data) : String(data);
    this.height = fontSize;

    const widthOf = (s: string) => getTextWidth(s, `${fontStyle} ${fontSize}px ${fontFamily}`);
    if (widthOf(this.data) > maxWidth) {
      let truncatedText = Config.Ellipsis.toString();
      let i = 0;
      while (widthOf(this.data.substr(0, i) + Config.Ellipsis.toString()) < maxWidth) {
        truncatedText = this.data.substr(0, i++) + Config.Ellipsis.toString();
      }
      this.width = widthOf(truncatedText);
      this.data = truncatedText;
    } else {
      this.width = Math.max(Config.TextMinWidth, widthOf(this.data));
    }
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    const container = currentTarget.getStage()?.container();
    container && (container.style.cursor = 'pointer');
    this.labelRef.current.moveToTop();
    this.labelRef.current.show();
    currentTarget.getLayer()?.draw();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    const container = currentTarget.getStage()?.container();
    container && (container.style.cursor = 'default');
    this.labelRef.current.hide();
    currentTarget.getLayer()?.draw();
  };

  draw(): React.ReactNode {
    const props = {
      fontFamily: this.options.fontFamily,
      fontSize: this.options.fontSize,
      fontStyle: this.options.fontStyle,
      fill: Config.SA_WHITE.toString()
    };
    return (
      <React.Fragment key={Layout.key++}>
        <KonvaLabel
          x={this.x}
          y={this.y}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaText {...ShapeDefaultProps} key={Layout.key++} text={this.data} {...props} />
        </KonvaLabel>
        <KonvaLabel
          x={this.x}
          y={this.y}
          ref={this.labelRef}
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
