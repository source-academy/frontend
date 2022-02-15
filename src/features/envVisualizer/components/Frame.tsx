import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Env, EnvTreeNode, Hoverable, Visible } from '../EnvVisualizerTypes';
import {
  getNonEmptyEnv,
  getTextWidth,
  isDummyKey,
  isPrimitiveData,
  isUnassigned,
  setHoveredStyle,
  setUnhoveredStyle
} from '../EnvVisualizerUtils';
import { Arrow } from './arrows/Arrow';
import { Binding } from './Binding';
import { Level } from './Level';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';

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
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number = Config.FrameMinWidth;

  /** total height = frame height + frame title height */
  totalHeight: number;
  /** width of this frame + max width of the bound values */
  totalWidth: number;
  totalHoveredWidth: number;

  /** the bindings this frame contains */
  readonly bindings: Binding[] = [];
  /** name of this frame to display */
  readonly name: Text;
  /** the level in which this frame resides */
  level: Level | undefined;
  /** environment associated with this frame */
  environment: Env;
  /** the parent/enclosing frame of this frame (the frame above it) */
  readonly parentFrame: Frame | undefined;
  static maxX: number = Config.CanvasPaddingX.valueOf();
  static cumWidths: number[] = [Config.CanvasPaddingX.valueOf()];
  static heights: number[] = [Config.CanvasPaddingY.valueOf()];
  offsetY: number;
  ref: RefObject<any> = React.createRef();

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly xCoord: number,
    readonly yCoord: number
  ) {
    this.level = envTreeNode.level as Level;
    this.environment = envTreeNode.environment;
    this.parentFrame = envTreeNode.parent?.frame;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this._x = xCoord === 0 ? Config.FrameMarginX : Frame.cumWidths[xCoord];

    this.name = new Text(
      frameNames.get(this.environment.name) || this.environment.name,
      this.x(),
      this.level.y(),
      { maxWidth: this.width() }
    );
    this.offsetY = this.name.height() + Config.TextPaddingY / 3;
    this._y = this.level.y() + this.offsetY;
    this._width = Config.FramePaddingX * 2;
    this.totalWidth = this.width();
    this.totalHoveredWidth = this.totalWidth;
    this._height = Config.FramePaddingY * 2;
    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;
    this.update(envTreeNode);
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

  /**
   * Find the frame x-coordinate given a x-position.
   * @param x absolute position
   * @returns Largest x-coordinate smaller than or equal to a given x position.
   */
  static lastXCoordBelow(x: number) {
    let l = Frame.cumWidths.length;
    while (l--) {
      if (Frame.cumWidths[l] <= x) {
        return l;
      }
    }
    return 0;
  }

  /**
   * update absolute position of frame and its bindings.
   * @param x Target x-position
   * @param y Target y-position
   */
  updatePosition = (x: number, y: number) => {
    this._x = x;
    this._y = y + this.offsetY;
    this.name.updatePosition(this.x(), y);
    this.bindings.forEach(binding => {
      binding.updatePosition(this.x(), y);
    });
  };

  update = (envTreeNode: EnvTreeNode) => {
    this.level = envTreeNode.level as Level;
    this.environment = envTreeNode.environment;
    this.offsetY = this.name.height() + Config.TextPaddingY / 3;
    this._y = this.level.y() + this.offsetY;
    // width of the frame = max width of the bindings in the frame + frame padding * 2
    let maxBindingWidth = 0;
    for (const [key, data] of Object.entries(this.environment.head)) {
      const bindingWidth =
        Math.max(Config.TextMinWidth, getTextWidth(key + Config.ConstantColon)) +
        Config.TextPaddingX +
        (isUnassigned(data)
          ? Math.max(Config.TextMinWidth, getTextWidth(Config.UnassignedData.toString()))
          : isPrimitiveData(data)
          ? Math.max(Config.TextMinWidth, getTextWidth(String(data)))
          : 0);
      maxBindingWidth = Math.max(maxBindingWidth, bindingWidth);
    }
    this._width = maxBindingWidth + Config.FramePaddingX * 2;

    // initializes bindings (keys + values)
    let prevBinding: Binding | null = null;
    let totalWidth = this._width;
    this.totalHoveredWidth = Math.max(totalWidth, this.name.hoveredWidth());

    const descriptors = Object.getOwnPropertyDescriptors(this.environment.head);
    const entries = [];
    const dummyEntries = [];
    for (const entry of Object.entries(descriptors)) {
      if (isDummyKey(entry[0])) {
        const actualEnv = getNonEmptyEnv(entry[1].value.environment);
        if (
          this.environment.id === Config.GlobalEnvId ||
          (actualEnv && actualEnv.id === this.environment.id)
        ) {
          dummyEntries.push(entry);
        }
      } else {
        entries.push(entry);
      }
    }
    entries.push(...dummyEntries);

    for (const [key, data] of entries) {
      const currBinding: Binding = new Binding(key, data.value, this, prevBinding, !data.writable);
      if (this.bindings.findIndex(v => v.value === currBinding.value) === -1) {
        this.bindings.push(currBinding);
        prevBinding = currBinding;
        totalWidth = Math.max(totalWidth, currBinding.width() + Config.FramePaddingX);
        this.totalHoveredWidth = Math.max(
          this.totalHoveredWidth,
          currBinding.hoveredWidth() + Config.FramePaddingX
        );
      }
    }

    if (EnvVisualizer.getPrintableMode()) {
      this.totalWidth = this.totalHoveredWidth;
    } else {
      this.totalWidth = totalWidth;
    }

    // derive the height of the frame from the the position of the last binding
    this._height = prevBinding
      ? prevBinding.y() + prevBinding.height() + Config.FramePaddingY - this.y()
      : Config.FramePaddingY * 2;
    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;
    const nextX = Frame.cumWidths[this.xCoord] + this.totalWidth + Config.FrameMarginX;
    Frame.cumWidths[this.xCoord + 1] =
      Frame.cumWidths[this.xCoord + 1] === undefined
        ? nextX
        : Math.max(Frame.cumWidths[this.xCoord + 1], nextX);
    Frame.maxX = Math.max(
      Frame.maxX,
      Frame.cumWidths[this.xCoord] + this.totalHoveredWidth,
      Frame.cumWidths[Frame.cumWidths.length - 1]
    );
    Frame.heights[this.yCoord] = Math.max(
      Frame.heights[this.yCoord] || 0,
      this.totalHeight + Config.FrameMarginY
    );
  };

  static reset = () => {
    Frame.maxX = Config.CanvasPaddingX.valueOf();
    Frame.cumWidths = [Config.CanvasPaddingX.valueOf()];
    Frame.heights = [Config.CanvasPaddingY.valueOf()];
  };

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {this.parentFrame && Arrow.from(this).to(this.parentFrame).draw()}
        {this.bindings.map(binding => !(binding.data instanceof ArrayValue) && binding.draw())}
        {this.name.draw()}
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            EnvVisualizer.getPrintableMode()
              ? Config.SA_BLUE.toString()
              : Config.SA_WHITE.toString()
          }
          cornerRadius={Number(Config.FrameCornerRadius)}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={Layout.key++}
        />
      </Group>
    );
  }
}
