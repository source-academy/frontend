import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Rect } from 'react-konva';

import { Config } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Env, EnvTreeNode, Hoverable, Visible } from '../EnvVisualizerTypes';
import {
  getTextWidth,
  isPrimitiveData,
  setHoveredStyle,
  setUnhoveredStyle
} from '../EnvVisualizerUtils';
import { Arrow } from './arrows/Arrow';
import { Binding } from './Binding';
import { Level } from './Level';
import { Text } from './Text';

const frameNames = new Map([
  ['global', 'Global'],
  ['programEnvironment', 'Program'],
  ['forLoopEnvironment', 'Body of for-loop'],
  ['forBlockEnvironment', 'Control variable of for-loop'],
  ['blockEnvironment', 'Block'],
  ['functionBodyEnvironment', 'Function Body']
]);

/** this class encapsulates a frame of key-value bindings to be drawn on canvas */
export class Frame implements Visible, Hoverable {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number = Config.FrameMinWidth;
  /** total height = frame height + frame title height */
  readonly totalHeight: number;
  /** width of this frame + max width of the bound values */
  readonly totalWidth: number;

  /** the bindings this frame contains */
  readonly bindings: Binding[] = [];
  /** name of this frame to display */
  readonly name: Text;
  /** the level in which this frame resides */
  readonly level: Level | undefined;
  /** environment associated with this frame */
  readonly environment: Env;
  /** the parent/enclosing frame of this frame (the frame above it) */
  readonly parentFrame: Frame | undefined;

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly leftSiblingFrame: Frame | null
  ) {
    this.level = envTreeNode.level as Level;
    this.environment = envTreeNode.environment;
    this.parentFrame = envTreeNode.parent?.frame;
    this.x = this.level.x;
    // derive the x coordinate from the left sibling frame
    this.leftSiblingFrame &&
      (this.x += this.leftSiblingFrame.x + this.leftSiblingFrame.totalWidth + Config.FrameMarginX);
    this.name = new Text(
      String(frameNames.get(this.environment.name) || this.environment.name),
      this.x,
      this.level.y,
      { maxWidth: this.width }
    );
    this.y = this.level.y + this.name.height + Config.TextPaddingY / 2;

    // width of the frame = max width of the bindings in the frame + frame padding * 2 (the left and right padding)
    let maxBindingWidth = 0;
    for (const [key, data] of Object.entries(this.environment.head)) {
      const bindingWidth =
        Math.max(Config.TextMinWidth, getTextWidth(String(key + Config.VariableColon))) +
        Config.TextPaddingX +
        (isPrimitiveData(data) ? Math.max(Config.TextMinWidth, getTextWidth(String(data))) : 0);
      maxBindingWidth = Math.max(maxBindingWidth, bindingWidth);
    }
    this.width = maxBindingWidth + Config.FramePaddingX * 2;

    // initializes bindings (keys + values)
    let prevBinding: Binding | null = null;
    let totalWidth = this.width;
    for (const [key, data] of Object.entries(this.environment.head)) {
      const currBinding: Binding = new Binding(String(key), data, this, prevBinding);
      this.bindings.push(currBinding);
      prevBinding = currBinding;
      totalWidth = Math.max(totalWidth, currBinding.width + Config.FramePaddingX);
    }
    this.totalWidth = totalWidth;

    // derive the height of the frame from the the position of the last binding
    this.height = prevBinding
      ? prevBinding.y + prevBinding.height + Config.FramePaddingY - this.y
      : Config.FramePaddingY * 2;

    this.totalHeight = this.height + this.name.height + Config.TextPaddingY / 2;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        {this.name.draw()}
        <Rect
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          stroke={Config.SA_WHITE.toString()}
          cornerRadius={Number(Config.FrameCornerRadius)}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={Layout.key++}
        />
        {this.bindings.map(binding => binding.draw())}
        {this.parentFrame && Arrow.from(this).to(this.parentFrame).draw()}
      </React.Fragment>
    );
  }
}
