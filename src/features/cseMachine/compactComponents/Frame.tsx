import React from 'react';
import { Group, Rect } from 'react-konva';

import { Visible } from '../components/Visible';
import CseMachine from '../CseMachine';
import { CompactConfig, ShapeDefaultProps } from '../CseMachineCompactConfig';
import { Layout } from '../CseMachineLayout';
import { Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
import {
  currentItemSAColor,
  getNonEmptyEnv,
  getTextWidth,
  isDummyKey,
  isPrimitiveData,
  isUnassigned
} from '../CseMachineUtils';
import { ArrowFromFrame } from './arrows/ArrowFromFrame';
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
    this._width = CompactConfig.FrameMinWidth;
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
      // If the value is unassigned, retrieve declaration type from its description, otherwise, retrieve directly from the data's property
      const constant =
        this.environment.head[key].description === 'const declaration' || !data.writable;
      const currBinding: Binding = new Binding(key, data.value, this, prevBinding, constant);
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
          cornerRadius={Number(CompactConfig.FrameCornerRadius)}
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
