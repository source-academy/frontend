import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
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
  private _width: number = CompactConfig.FrameMinWidth;
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
  ref: RefObject<any> = React.createRef();

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly leftSiblingFrame: Frame | null
  ) {
    this.level = envTreeNode.compactLevel as Level;
    this.environment = envTreeNode.environment;
    this.parentFrame = envTreeNode.parent?.compactFrame;
    this._x = this.level.x();
    // derive the x coordinate from the left sibling frame
    this.leftSiblingFrame &&
      (this._x +=
        this.leftSiblingFrame.x() + this.leftSiblingFrame.totalWidth + CompactConfig.FrameMarginX);

    this.name = new Text(
      frameNames.get(this.environment.name) || this.environment.name,
      this.x(),
      this.level.y(),
      { maxWidth: this.width() }
    );
    this._y = this.level.y() + this.name.height() + CompactConfig.TextPaddingY / 2;

    // width of the frame = max width of the bindings in the frame + frame padding * 2 (the left and right padding)
    let maxBindingWidth = 0;
    for (const [key, data] of Object.entries(this.environment.head)) {
      const bindingWidth =
        Math.max(CompactConfig.TextMinWidth, getTextWidth(key + CompactConfig.ConstantColon)) +
        CompactConfig.TextPaddingX +
        (isUnassigned(data)
          ? Math.max(
              CompactConfig.TextMinWidth,
              getTextWidth(CompactConfig.UnassignedData.toString())
            )
          : isPrimitiveData(data)
          ? Math.max(CompactConfig.TextMinWidth, getTextWidth(String(data)))
          : 0);
      maxBindingWidth = Math.max(maxBindingWidth, bindingWidth);
    }
    this._width = maxBindingWidth + CompactConfig.FramePaddingX * 2;

    // initializes bindings (keys + values)
    let prevBinding: Binding | null = null;
    let totalWidth = this._width;

    const descriptors = Object.getOwnPropertyDescriptors(this.environment.head);
    const entries = [];
    const dummyEntries = [];
    for (const entry of Object.entries(descriptors)) {
      if (isDummyKey(entry[0])) {
        const actualEnv = getNonEmptyEnv(entry[1].value.environment);
        if (
          this.environment.id === CompactConfig.GlobalEnvId ||
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
      this.bindings.push(currBinding);
      prevBinding = currBinding;
      totalWidth = Math.max(totalWidth, currBinding.width() + CompactConfig.FramePaddingX);
    }
    this.totalWidth = totalWidth;

    // derive the height of the frame from the the position of the last binding
    this._height = prevBinding
      ? prevBinding.y() + prevBinding.height() + CompactConfig.FramePaddingY - this.y()
      : CompactConfig.FramePaddingY * 2;

    this.totalHeight = this.height() + this.name.height() + CompactConfig.TextPaddingY / 2;
  }

  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  width(): number {
    return this._width;
  }
  height(): number {
    return this._height;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++}>
        {this.name.draw()}
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            EnvVisualizer.getPrintableMode()
              ? CompactConfig.SA_BLUE.toString()
              : CompactConfig.SA_WHITE.toString()
          }
          cornerRadius={Number(CompactConfig.FrameCornerRadius)}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={Layout.key++}
        />
        {this.bindings.map(binding => binding.draw())}
        {this.parentFrame && Arrow.from(this).to(this.parentFrame).draw()}
      </Group>
    );
  }
}
