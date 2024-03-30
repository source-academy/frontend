import React from 'react';
import { Group, Rect } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { DataArray, Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
import {
  currentItemSAColor,
  getTextWidth,
  getUnreferencedObjects,
  isDataArray,
  isPrimitiveData,
  isUnassigned,
  setDifference
} from '../CseMachineUtils';
import { ArrowFromFrame } from './arrows/ArrowFromFrame';
import { Binding } from './Binding';
import { Level } from './Level';
import { Text } from './Text';
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
    super();
    this._width = Config.FrameMinWidth;
    this.level = envTreeNode.level as Level;
    this.environment = envTreeNode.environment;
    this.parentFrame = envTreeNode.parent?.frame;
    this._x = this.level.x();
    // derive the x coordinate from the left sibling frame
    this.leftSiblingFrame &&
      (this._x +=
        this.leftSiblingFrame.x() + this.leftSiblingFrame.totalWidth + Config.FrameMarginX);

    this.name = new Text(
      frameNames.get(this.environment.name) || this.environment.name,
      this.x(),
      this.level.y(),
      { maxWidth: this.width() }
    );
    this._y = this.level.y() + this.name.height() + Config.TextPaddingY / 2;

    // width of the frame = max width of the bindings in the frame + frame padding * 2 (the left and right padding)
    let maxBindingWidth = 0;
    for (const [key, data] of Object.entries(this.environment.head)) {
      const bindingWidth =
        Math.max(Config.TextMinWidth, getTextWidth(key + Config.ConstantColon)) +
        Config.TextPaddingX +
        (isUnassigned(data)
          ? Math.max(Config.TextMinWidth, getTextWidth(Config.UnassignedData))
          : isPrimitiveData(data)
          ? Math.max(Config.TextMinWidth, getTextWidth(String(data)))
          : 0);
      maxBindingWidth = Math.max(maxBindingWidth, bindingWidth);
    }
    this._width = maxBindingWidth + Config.FramePaddingX * 2;

    // initializes bindings (keys + values)
    let prevBinding: Binding | null = null;
    let totalWidth = this._width;

    // get all keys and object descriptors of each value inside the head
    const entries = Object.entries(Object.getOwnPropertyDescriptors(this.environment.head));

    // get values that are unreferenced, which will used to created dummy bindings
    const unreferencedValues = getUnreferencedObjects(this.environment);

    // find arrays that are nested inside other arrays, and prevent them from creating new
    // dummy bindings, as they should be drawn around the original parent array instead
    const nestedArrays = new Set<DataArray>();
    for (const value of unreferencedValues) {
      if (isDataArray(value)) {
        for (const data of value) {
          if (isDataArray(data) && data !== value) {
            nestedArrays.add(data);
            // Since deeply nested arrays always come first inside the heap order, there is no need
            // to do a recursive search for deeply nested arrays, as they would have already been
            // added to the nestedArrays set by this point.
          }
        }
      }
    }
    // Add dummy bindings to `entries`
    for (const value of setDifference(unreferencedValues, nestedArrays)) {
      const descriptor: TypedPropertyDescriptor<any> & PropertyDescriptor = {
        value,
        configurable: false,
        enumerable: true,
        writable: false
      };
      // The key is a number string to "disguise" as a dummy binding
      // TODO: revamp the dummy binding behavior, don't rely on numeric keys
      entries.push(['0', descriptor]);
    }

    for (const [key, data] of entries) {
      // If the value is unassigned, retrieve declaration type from its description, otherwise, retrieve directly from the data's property
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      const currBinding: Binding = new Binding(key, data.value, this, prevBinding, constant);
      this.bindings.push(currBinding);
      prevBinding = currBinding;
      totalWidth = Math.max(totalWidth, currBinding.width() + Config.FramePaddingX);
    }
    this.totalWidth = totalWidth;

    // derive the height of the frame from the the position of the last binding
    this._height = prevBinding
      ? prevBinding.y() + prevBinding.height() + Config.FramePaddingY - this.y()
      : Config.FramePaddingY * 2;

    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;
  }

  onMouseEnter = () => {};

  onMouseLeave = () => {};

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
          stroke={currentItemSAColor(CseMachine.getCurrentEnvId() === this.environment?.id)}
          cornerRadius={Config.FrameCornerRadius}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={Layout.key++}
        />
        {this.bindings.map(binding => binding.draw())}
        {this.parentFrame && new ArrowFromFrame(this).to(this.parentFrame).draw()}
      </Group>
    );
  }
}
