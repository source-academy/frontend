import React from 'react';
import { Group, Rect } from 'react-konva';

import CseMachine from '../CseMachine';
import { CseAnimation } from '../CseMachineAnimation';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
import {
  defaultActiveColor,
  defaultStrokeColor,
  getTextWidth,
  getUnreferencedObjects,
  isClosure,
  isDataArray,
  isDummyKey,
  isPrimitiveData,
  isSourceObject,
  isUnassigned
} from '../CseMachineUtils';
import { isContinuation } from '../utils/scheme';
import { ArrowFromFrame } from './arrows/ArrowFromFrame';
import { GenericArrow } from './arrows/GenericArrow';
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
  private static envFrameMap: Map<string, Frame> = new Map();
  public static getFrom(environment: Env): Frame | undefined {
    return Frame.envFrameMap.get(environment.id);
  }

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
  /** arrow that is drawn from this frame to the parent frame */
  readonly arrow: GenericArrow<Frame, Frame> | undefined;

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly leftSiblingFrame: Frame | null
  ) {
    super();

    this.level = envTreeNode.level as Level;
    this.parentFrame = envTreeNode.parent?.frame;
    this.environment = envTreeNode.environment;
    Frame.envFrameMap.set(this.environment.id, this);

    this._x = this.leftSiblingFrame
      ? this.leftSiblingFrame.x() + this.leftSiblingFrame.totalWidth + Config.FrameMarginX
      : this.level.x();
    // ensure x coordinate cannot be less than that of parent frame
    if (this.parentFrame) this._x = Math.max(this._x, this.parentFrame.x());
    this._y = this.level.y() + Config.FontSize + Config.TextPaddingY / 2;

    // get all keys and object descriptors of each value inside the head
    const entries = Object.entries(Object.getOwnPropertyDescriptors(this.environment.head));

    // move the global frame default text to the first position if it isn't in there already
    if (this.environment.name === 'global' && entries[0][0] !== Config.GlobalFrameDefaultText) {
      const index = entries.findIndex(([key]) => key === Config.GlobalFrameDefaultText);
      entries.unshift(entries.splice(index, 1)[0]);
    }

    // get values that are unreferenced, which will used to created dummy bindings
    const unreferencedValues = [...getUnreferencedObjects(this.environment)];

    // TODO: find out why values are not added to heap on the correct order in JS Slang
    // For now, sorting is a good workaround since id also increases in insertion order
    unreferencedValues.sort((v1, v2) => Number(v1.id) - Number(v2.id));

    // find objects that are nested inside other arrays, and prevent them from creating new
    // dummy bindings by removing them from unreferencedValues, as they should be drawn
    // around the original parent array instead
    let i = 0;
    while (i < unreferencedValues.length) {
      const value = unreferencedValues[i];
      if (isDataArray(value)) {
        for (const data of value) {
          if ((isDataArray(data) && data !== value) || isClosure(data) || isContinuation(data)) {
            const prev = unreferencedValues.findIndex(value => value.id === data.id);
            if (prev > -1) {
              unreferencedValues.splice(prev, 1);
              if (prev <= i) i--;
            }
          }
        }
      }
      i++;
    }

    // Add dummy bindings to `entries`
    for (const value of unreferencedValues) {
      const descriptor: TypedPropertyDescriptor<any> & PropertyDescriptor = {
        value,
        configurable: false,
        enumerable: true,
        writable: false
      };
      // The key is a number string to "disguise" as a dummy binding
      entries.push([`${i++}`, descriptor]);
    }

    // Find the correct width of the frame before creating the bindings
    this._width = Config.FrameMinWidth;
    let totalWidth = this._width + Config.FrameMinGapX;
    for (const [key, data] of entries) {
      if (isDummyKey(key)) continue;
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      let bindingTextWidth = getTextWidth(
        key + (constant ? Config.ConstantColon : Config.VariableColon)
      );
      if (isUnassigned(data.value)) {
        bindingTextWidth += Config.TextPaddingX + getTextWidth(Config.UnassignedData);
      } else if (isPrimitiveData(data.value)) {
        bindingTextWidth +=
          Config.TextPaddingX +
          getTextWidth(
            isSourceObject(data.value)
              ? data.value.toReplString()
              : JSON.stringify(data.value) || String(data.value)
          );
      }
      this._width = Math.max(this._width, bindingTextWidth + Config.FramePaddingX * 2);
      totalWidth = Math.max(totalWidth, this._width + Config.FrameMinGapX);
    }

    // Create all the bindings and values
    let prevBinding: Binding | null = null;
    for (const [key, data] of entries) {
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      const currBinding: Binding = new Binding(key, data.value, this, prevBinding, constant);
      prevBinding = currBinding;
      this.bindings.push(currBinding);
      totalWidth = Math.max(totalWidth, currBinding.width() + Config.FramePaddingX);
    }
    this.totalWidth = totalWidth;

    // derive the height of the frame from the the position of the last binding
    this._height = prevBinding
      ? prevBinding.y() - this.y() + prevBinding.height() + Config.FramePaddingY
      : Config.FramePaddingY * 2;

    this.name = new Text(
      frameNames.get(this.environment.name) ?? this.environment.name,
      this.x(),
      this.level.y(),
      { maxWidth: this.width() }
    );
    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;

    if (this.parentFrame) this.arrow = new ArrowFromFrame(this).to(this.parentFrame);

    if (CseMachine.getCurrentEnvId() === this.environment.id) {
      CseAnimation.setCurrentFrame(this);
    }
  }

  onMouseEnter = () => {};

  onMouseLeave = () => {};

  draw(): React.ReactNode {
    return (
      <Group ref={this.ref} key={Layout.key++}>
        {this.name.draw()}
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            CseMachine.getCurrentEnvId() === this.environment?.id
              ? defaultActiveColor()
              : defaultStrokeColor()
          }
          cornerRadius={Config.FrameCornerRadius}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={Layout.key++}
        />
        {this.bindings.map(binding => binding.draw())}
        {this.arrow?.draw()}
      </Group>
    );
  }
}
