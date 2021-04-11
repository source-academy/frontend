import { KonvaEventObject } from 'konva/types/Node';
import React, { RefObject } from 'react';
import { Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Hoverable, Visible } from '../../../EnvVisualizerTypes';
import { getTextWidth } from '../../../EnvVisualizerUtils';

export type TextOptions = {
  maxWidth: number;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fontVariant: string;
};

export const defaultOptions: TextOptions = {
  maxWidth: Number.MAX_VALUE, // maximum width this text should be
  fontFamily: Config.FontFamily.toString(), // default is Arial
  fontSize: Number(Config.FontSize), // in pixels. Default is 12
  fontStyle: Config.FontStyle.toString(), // can be normal, bold, or italic. Default is normal
  fontVariant: Config.FontVariant.toString() // can be normal or small-caps. Default is normal
};

/** this class encapsulates a string to be drawn onto the canvas */
export class Text implements Visible, Hoverable {
  readonly height: number;
  readonly width: number;
  readonly options: TextOptions;
  readonly fullStr: string;
  private labelRef: RefObject<any> = React.createRef();

  constructor(
    readonly str: string,
    readonly x: number,
    readonly y: number,
    /** additional options (for customization of text) */
    options: Partial<TextOptions> = {}
  ) {
    this.options = { ...defaultOptions, ...options };
    const { fontSize, fontStyle, fontFamily, maxWidth } = this.options;

    this.height = fontSize;
    this.fullStr = str;

    const widthOf = (s: string) => getTextWidth(s, `${fontStyle} ${fontSize}px ${fontFamily}`);
    if (widthOf(str) > maxWidth) {
      let truncatedText = Config.Ellipsis.toString(),
        i = 0;
      while (widthOf(str.substr(0, i) + Config.Ellipsis.toString()) < maxWidth) {
        truncatedText = str.substr(0, i++) + Config.Ellipsis.toString();
      }
      this.width = widthOf(truncatedText);
      this.str = truncatedText;
    } else {
      this.width = Math.max(Config.TextMinWidth, widthOf(str));
    }
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    const container = currentTarget.getStage()?.container();
    container && (container.style.cursor = 'pointer');
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
          <KonvaText key={Layout.key++} text={this.str} {...props} />
        </KonvaLabel>
        <KonvaLabel
          x={this.x}
          y={this.y}
          ref={this.labelRef}
          visible={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <KonvaTag fill={'black'} opacity={0.5} />
          <KonvaText key={Layout.key++} text={this.fullStr} {...props} />
        </KonvaLabel>
      </React.Fragment>
    );
  }
}
