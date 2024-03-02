import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group, Rect } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
import {
  getNonEmptyEnv,
  getTextWidth,
  isDummyKey,
  isPrimitiveData,
  isUnassigned
} from '../CseMachineUtils';
import { ArrowFromFrame } from './arrows/ArrowFromFrame';
import { GenericArrow } from './arrows/GenericArrow';
import { Binding } from './Binding';
import { Level } from './Level';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { Visible } from './Visible';

const frameNames = new Map([
  ['global', 'Global'],
  ['programEnvironment', 'Program'],
  ['forLoopEnvironment', 'Body of for-loop'],
  ['forBlockEnvironment', 'Control variable of for-loop'],
  ['blockEnvironment', 'Block'],
  ['functionBodyEnvironment', 'Function Body']
]);

/** this class encapsulates a frame of key-value bindings to be drawn on canvas */
export class Frame extends Visible implements IHoverable {
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
  static maxXCoord: number = -1;
  static maxX: number = Config.CanvasPaddingX.valueOf();
  static cumWidths: number[] = [Config.CanvasPaddingX.valueOf()];
  static heights: number[] = [Config.CanvasPaddingY.valueOf()];
  offsetY: number;
  /** set of values to highlight when frame is over. */
  private values: Visible[] = [];
  private selected: boolean = false;

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly xCoord: number,
    readonly yCoord: number
  ) {
    super();
    this._width = Config.FrameMinWidth;
    this.level = envTreeNode.level as Level;
    this.environment = envTreeNode.environment;
    this.parentFrame = envTreeNode.parent?.frame;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    Frame.maxXCoord = Math.max(xCoord, Frame.maxXCoord);
    this._x = xCoord === 0 ? Config.CanvasPaddingX : Frame.cumWidths[xCoord];

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

  trackObjects(value: Visible): boolean {
    const exists: boolean = this.values.includes(value);
    !exists && this.values.push(value);
    return !exists;
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
    this.values = [];

    // initializes bindings (keys + values)
    let prevBinding: Binding | null = null;
    let totalWidth = this._width;
    let exportWidth = this._width;
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
      if (
        this.bindings.findIndex(
          v =>
            v.value === currBinding.value &&
            (currBinding.isDummyBinding || v.keyString === currBinding.keyString)
        ) === -1
      ) {
        this.bindings.push(currBinding);
        prevBinding = currBinding;
        totalWidth = Math.max(totalWidth, currBinding.width() + Config.FramePaddingX);
        exportWidth = Math.max(exportWidth, currBinding.exportWidth() + Config.FramePaddingX);
        this.totalHoveredWidth = Math.max(
          this.totalHoveredWidth,
          currBinding.hoveredWidth() + Config.FramePaddingX
        );
      }
    }

    if (CseMachine.getPrintableMode()) {
      this.totalWidth = exportWidth;
    } else {
      this.totalWidth = totalWidth;
    }

    // derive the height of the frame from the the position of the last binding
    this._height = prevBinding
      ? prevBinding.y() + prevBinding.height() + Config.FramePaddingY - this.y()
      : Config.FramePaddingY * 2;
    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;
    const nextX =
      Frame.cumWidths[this.xCoord] + this.totalWidth + Config.FrameMarginX + Config.FnRadius;
    Frame.cumWidths[this.xCoord + 1] =
      Frame.cumWidths[this.xCoord + 1] === undefined
        ? nextX
        : Math.max(Frame.cumWidths[this.xCoord + 1], nextX);
    Frame.maxX = Math.max(
      Frame.maxX,
      Frame.cumWidths[this.xCoord] +
        (CseMachine.getPrintableMode() ? this.totalWidth : this.totalHoveredWidth),
      Frame.cumWidths[Frame.cumWidths.length - 1]
    );
    Frame.heights[this.yCoord] = Math.max(Frame.heights[this.yCoord] || 0, this.totalHeight);
  };

  static reset = () => {
    Frame.maxX = Config.CanvasPaddingX.valueOf();
    Frame.maxXCoord = -1;
    Frame.cumWidths = [Config.CanvasPaddingX.valueOf()];
    Frame.heights = [Config.CanvasPaddingY.valueOf()];
  };

  isSelected = () => {
    return this.selected;
  };

  onMouseEnter = () => {};

  onMouseLeave = () => {};

  /**
   * Highlights frame and
   */
  onClick = (e: KonvaEventObject<MouseEvent>) => {
    this.selected = !this.selected;
  };

  draw(): React.ReactNode {
    let arrowToParentFrame: GenericArrow<Frame, Frame> | undefined = undefined;
    if (this.parentFrame !== undefined) {
      arrowToParentFrame = new ArrowFromFrame(this).to(this.parentFrame);
      this.trackObjects(arrowToParentFrame);
    }
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {arrowToParentFrame && arrowToParentFrame.draw()}
        {this.bindings.map(binding => !(binding.data instanceof ArrayValue) && binding.draw())}
        {this.name.draw()}
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
          }
          cornerRadius={Number(Config.FrameCornerRadius)}
          key={Layout.key++}
          onClick={e => this.onClick(e)}
          onMouseEnter={() => this.onMouseEnter()}
          onMouseLeave={() => this.onMouseLeave()}
        />
      </Group>
    );
  }
}
