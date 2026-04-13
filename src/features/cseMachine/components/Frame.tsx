import { Rect as KonvaRect } from 'konva/lib/shapes/Rect';
import React from 'react';
import { Group, Rect } from 'react-konva';

import CseMachine from '../CseMachine';
import { CseAnimation } from '../CseMachineAnimation';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
import {
  defaultActiveColor,
  defaultBackgroundColor,
  defaultStrokeColor,
  fadedStrokeColor,
  getTextWidth,
  getUnreferencedObjects,
  isClosure,
  isDataArray,
  isDummyKey,
  isPrimitiveData,
  isSourceObject,
  isUnassigned
} from '../CseMachineUtils';
import { isContinuation } from '../utils/continuation';
import { ArrowFromFrame } from './arrows/ArrowFromFrame';
import { GenericArrow } from './arrows/GenericArrow';
import { Binding } from './Binding';
import { Level } from './Level';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { ContValue } from './values/ContValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';
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
  /** width budget of this frame block (excluding right-side data overflow) */
  readonly totalWidth: number;

  /** width of data beside frame */
  readonly totalDataWidth: number;
  /** the bindings this frame contains */
  readonly bindings: Binding[] = [];
  /** name of this frame to display */
  private _name!: Text; // removed readonly to allow reassignment for fixed layout
  private readonly rectRef = React.createRef<KonvaRect | null>();
  /** the level in which this frame resides */
  readonly level: Level | undefined;
  /** environment associated with this frame */
  readonly environment: Env;
  /** the parent/enclosing frame of this frame (the frame above it) */
  readonly parentFrame: Frame | undefined;
  /** arrow that is drawn from this frame to the parent frame */
  readonly arrow: GenericArrow<Frame, Frame> | undefined;
  /** check if this frame is live */
  readonly isLive: boolean;

  constructor(
    /** environment tree node that contains this frame */
    readonly envTreeNode: EnvTreeNode,
    /** the frame to the left of this frame, on the same level. used for calculating this frame's position */
    readonly leftSiblingFrame: Frame | null
  ) {
    super();

    this.totalDataWidth = 0;
    this.level = envTreeNode.level as Level;
    this.parentFrame = envTreeNode.parent?.frame;
    this.environment = envTreeNode.environment;
    Frame.envFrameMap.set(this.environment.id, this);

    this._x = this.leftSiblingFrame
      ? this.leftSiblingFrame.x() +
        this.leftSiblingFrame.totalWidth +
        this.leftSiblingFrame.totalDataWidth +
        Config.FrameMarginX
      : this.level.x();
    // Frames are strictly left-aligned within their level to prevent large gaps from forming.
    // Previously, a frame's position was also influenced by its parent's position, which could
    // cause an entire level of frames to be shifted undesirably.
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

    // Find the correct width of the frame before creating the bindings.
    // This pass sizes only the frame body (text and primitive values inside the frame).
    this._width = Config.FrameMinWidth;
    for (const [key, data] of entries) {
      if (isDummyKey(key)) continue;
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      let bindingTextWidth = getTextWidth(
        key + (constant ? Config.ConstantColon : Config.VariableColon)
      );
      // TODO: Check if key + colon size exceed default frame width
      if (isUnassigned(data.value)) {
        bindingTextWidth += Config.TextPaddingX + getTextWidth(Config.UnassignedData);
        // TODO: Check if unassigned text size exceed default frame width
      } else if (isPrimitiveData(data.value)) {
        bindingTextWidth +=
          Config.TextPaddingX +
          getTextWidth(
            isSourceObject(data.value)
              ? data.value.toReplString()
              : JSON.stringify(data.value) || String(data.value)
          );
        // TODO: Check if primitive value size exceed default frame width
      }
      // To replace later
      this._width = Math.max(this._width, bindingTextWidth + Config.FramePaddingX * 2);
      this._width = Math.min(this._width, Config.FrameDefaultWidth); // cap the frame width to default width
    }

    // Create all the bindings and values
    let prevBinding: Binding | null = null;
    let prevVisibleBinding: Binding | null = null;
    let lastVisibleBinding: Binding | null = null;

    this.isLive = this.environment ? Layout.liveEnvIDs.has(this.environment.id) : false;

    for (const [key, data] of entries) {
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      const previousBindingForLayout = Layout.clearDeadFrames ? prevVisibleBinding : prevBinding;
      const currBinding: Binding = new Binding(
        key,
        data.value,
        this,
        previousBindingForLayout,
        constant,
        this.isLive
      );
      prevBinding = currBinding;
      if (currBinding.occupiesVerticalSpace()) {
        prevVisibleBinding = currBinding;
        lastVisibleBinding = currBinding;
      }
      this.bindings.push(currBinding);
    }

    // Post-process using actual created values to get robust spacing for nested arrays/functions.
    // `totalDataWidth` is measured strictly as overflow beyond the frame's right edge.
    const frameRightX = this.x() + this.width();
    for (const binding of this.bindings) {
      if (!binding.rendersReferencedValue()) continue;

      const value = binding.value;
      let valueRightX: number | undefined;
      if (value instanceof ArrayValue) {
        valueRightX = value.x() + value.totalWidth;
      } else if (value instanceof FnValue || value instanceof GlobalFnValue) {
        valueRightX = CseMachine.getPrintableMode()
          ? value.x() + value.totalWidth
          : value.x() + value.width();
      } else if (value instanceof ContValue) {
        valueRightX = value.x() + value.width() + value.tooltipWidth;
      }

      if (valueRightX !== undefined) {
        const overflow = Math.max(0, valueRightX - frameRightX);
        this.totalDataWidth = Math.max(this.totalDataWidth, overflow);
      }
    }

    this.totalWidth = this.width();

    // derive the height of the frame from the the position of the last visible binding
    this._height = lastVisibleBinding
      ? lastVisibleBinding.y() - this.y() + lastVisibleBinding.height() + Config.FramePaddingY
      : Config.FramePaddingY * 2;

    this._name = new Text(
      frameNames.get(this.environment.name) ?? this.environment.name,
      this.x(),
      this.level.y(),
      { maxWidth: this.width(), faded: !this.isLive }
    );
    this.totalHeight = this.height() + this.name.height() + Config.TextPaddingY / 2;

    if (this.parentFrame) this.arrow = new ArrowFromFrame(this).to(this.parentFrame);

    if (CseMachine.getCurrentEnvId() === this.environment.id) {
      CseAnimation.setCurrentFrame(this);
    }
  }

  public get name(): Text {
    return this._name;
  }

  /**
   * Reassigns the coordinates according to the final position of this frame
   * @param newX taken from cached layout
   */
  reassignCoordinatesX(newX: number): void {
    this._x = newX;

    let textOffset = 0;
    if (CseMachine.getCenterAlignment()) {
      textOffset += Math.floor(this.width() / 2) - Math.floor(this.name.width() / 2);
    }
    this._name = new Text(
      frameNames.get(this.environment.name) ?? this.environment.name,
      this.x() + textOffset,
      this.level!.y(), // this method is only called after the frame is drawn
      { maxWidth: this.width(), faded: !this.isLive }
    );
  }

  /**
   * Reassigns the coordinates according to the final position of this frame
   * @param newY taken from cached layout
   */
  reassignCoordinatesY(newY: number): void {
    this._y = newY;
    const relativeTextY = newY - (Config.FontSize + Config.TextPaddingY / 2);
    this.name.setY(relativeTextY);
  }

  reassignWidth(newWidth: number): void {
    this._width = newWidth;
  }

  onMouseEnter = () => {};

  onMouseLeave = () => {};

  setArrowSourceHighlightedStyle(): void {
    if (this.isLive) {
      this.rectRef.current?.stroke(Config.HoverColor);
    } else {
      this.rectRef.current?.stroke(Config.HoverDeadColor);
    }
    this.name.setArrowSourceHighlightedStyle();
  }

  setArrowSourceNormalStyle(): void {
    this.rectRef.current?.stroke(
      CseMachine.getCurrentEnvId() === this.environment?.id
        ? defaultActiveColor()
        : this.isLive
          ? defaultStrokeColor()
          : fadedStrokeColor()
    );
    this.name.setArrowSourceNormalStyle();
  }

  draw(): React.ReactNode {
    if (CseAnimation.shouldHideFrame(this.environment.id)) {
      return null;
    }

    return (
      <Group ref={this.ref} key={Layout.key++}>
        {this.name.draw()}

        <Rect
          {...ShapeDefaultProps}
          ref={this.rectRef}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            CseMachine.getCurrentEnvId() === this.environment?.id
              ? defaultActiveColor()
              : this.isLive
                ? defaultStrokeColor()
                : fadedStrokeColor()
          }
          cornerRadius={Config.FrameCornerRadius}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          listening={false}
          key={Layout.key++}
          fill={defaultBackgroundColor()}
        />
        {this.bindings.map(binding => binding.draw())}
        {this.arrow?.draw()}
      </Group>
    );
  }
}
