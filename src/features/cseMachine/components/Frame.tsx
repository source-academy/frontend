import { Rect as KonvaRect } from 'konva/lib/shapes/Rect';
import { createRef } from 'react';
import { Group, Rect } from 'react-konva';

import CseMachine from '../CseMachine';
import { CseAnimation } from '../CseMachineAnimation';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import type { Env, EnvTreeNode, IHoverable } from '../CseMachineTypes';
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
  isUnassigned,
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
  ['global', 'Built-in functions'],
  ['programEnvironment', 'Globals'],
  ['forLoopEnvironment', 'Body of for-loop'],
  ['forBlockEnvironment', 'Control variable of for-loop'],
  ['blockEnvironment', 'Block'],
  ['functionBodyEnvironment', 'Function Body'],
]);

/** this class encapsulates a frame of key-value bindings to be drawn on canvas */
export class Frame extends Visible implements IHoverable {
  private static envFrameMap: Map<string, Frame> = new Map();
  public static getFrom(environment: Env): Frame | undefined {
    return Frame.envFrameMap.get(environment.id);
  }
  public static clearMap(): void {
    Frame.envFrameMap.clear();
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
  /**
   * annotation naming the names in this frame that resolve via the global frame instead of the
   * usual enclosing-scope chain (e.g. Python's `global` statement) — drawn on its own row above
   * the frame's box, stacked below the frame name, rather than as a binding inside the box.
   * Undefined if this frame declares no such names.
   */
  private _globalNamesText: Text | undefined;
  private readonly rectRef = createRef<KonvaRect | null>();
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
    readonly leftSiblingFrame: Frame | null,
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

    // `globalNames` is stashed onto the fake Environment by CseSnapshotAdapter.ts (see there);
    // Env (js-slang's real Environment type) has no such field, so a cast is unavoidable here.
    const globalNames = (this.environment as unknown as { globalNames?: string[] }).globalNames;
    const globalNamesLabel =
      globalNames && globalNames.length > 0 ? `globals: ${globalNames.join(', ')}` : undefined;

    // One header row for the frame name; a second, stacked below it, for the globals
    // annotation when present. Stacked (rather than side-by-side) because frame names come
    // from arbitrary function names and can be any length, so they can't safely share a row.
    const headerRowHeight = Config.FontSize + Config.TextPaddingY / 2;
    // Frames are strictly left-aligned within their level to prevent large gaps from forming.
    // Previously, a frame's position was also influenced by its parent's position, which could
    // cause an entire level of frames to be shifted undesirably.
    this._y = this.level.y() + headerRowHeight * (globalNamesLabel ? 2 : 1);

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
              if (prev <= i) {
                i--;
              }
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
        writable: false,
      };
      // The key is a number string to "disguise" as a dummy binding
      entries.push([`${i++}`, descriptor]);
    }

    // Find the correct width of the frame before creating the bindings.
    // This pass sizes only the frame body (text and primitive values inside the frame).
    this._width = Config.FrameMinWidth;
    for (const [key, data] of entries) {
      if (isDummyKey(key)) {
        continue;
      }
      const constant =
        this.environment.head[key]?.description === 'const declaration' || !data.writable;
      let bindingTextWidth = getTextWidth(
        key + (constant ? Config.ConstantColon : Config.VariableColon),
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
              : JSON.stringify(data.value) || String(data.value),
          );
        // TODO: Check if primitive value size exceed default frame width
      }
      // To replace later
      this._width = Math.max(this._width, bindingTextWidth + Config.FramePaddingX * 2);
      this._width = Math.min(this._width, Config.FrameDefaultWidth); // cap the frame width to default width
    }
    // Same width-sizing treatment as bindings above: widen the box to fit the annotation
    // (capped at the same default max width bindings are capped at).
    if (globalNamesLabel) {
      this._width = Math.max(
        this._width,
        getTextWidth(globalNamesLabel) + Config.FramePaddingX * 2,
      );
      this._width = Math.min(this._width, Config.FrameDefaultWidth);
    }

    this.isLive = this.environment ? Layout.liveEnvIDs.has(this.environment.id) : false;

    // Create all the bindings and values
    let prevBinding: Binding | null = null;
    let prevVisibleBinding: Binding | null = null;
    let lastVisibleBinding: Binding | null = null;

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
        this.isLive,
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
      if (!binding.rendersReferencedValue()) {
        continue;
      }

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
      { maxWidth: this.width(), faded: !this.isLive },
    );

    // Floats above the frame's box, on its own row below the name — not a binding inside the
    // box. Marks that a lookup for these names skips the usual enclosing-scope walk and jumps
    // straight to the global frame. Stacked below the name (rather than beside it) since frame
    // names are arbitrary function names of unpredictable length and could collide with it.
    // Left-aligned like the name. The box was already widened above to fit this label (same
    // treatment as binding text), so maxWidth only clips in the same rare case bindings do:
    // when the label alone would exceed Config.FrameDefaultWidth.
    if (globalNamesLabel) {
      this._globalNamesText = new Text(
        globalNamesLabel,
        this.x(),
        this.level.y() + headerRowHeight,
        {
          maxWidth: this.width(),
          faded: !this.isLive,
        },
      );
    }

    this.totalHeight = this.height() + (this.y() - this.level.y());

    if (this.parentFrame) {
      this.arrow = new ArrowFromFrame(this).to(this.parentFrame);
    }

    if (CseMachine.getCurrentEnvId() === this.environment.id) {
      CseAnimation.setCurrentFrame(this);
    }
  }

  public get name(): Text {
    return this._name;
  }

  public get globalNamesText(): Text | undefined {
    return this._globalNamesText;
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
      { maxWidth: this.width(), faded: !this.isLive },
    );
    this._globalNamesText?.setX(this.x());
  }

  /**
   * Reassigns the coordinates according to the final position of this frame
   * @param newY taken from cached layout
   */
  reassignCoordinatesY(newY: number): void {
    this._y = newY;
    const headerRowHeight = Config.FontSize + Config.TextPaddingY / 2;
    const levelY = newY - headerRowHeight * (this._globalNamesText ? 2 : 1);
    this.name.setY(levelY);
    this._globalNamesText?.setY(levelY + headerRowHeight);
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
          : fadedStrokeColor(),
    );
    this.name.setArrowSourceNormalStyle();
  }

  draw(): React.ReactNode {
    if (CseAnimation.shouldHideFrame(this.environment.id)) {
      return null;
    }

    return (
      <Group ref={this.ref} key={Layout.key++}>
        {/*
          The header rows (name, globals annotation) float above the frame's box, in the same
          gap that the parent/tail arrow passes through. Arrows are already drawn on a Konva
          layer behind this one, but plain text has no opaque fill, so the arrow line still
          shows through the empty space between glyphs. An opaque backing rect the size of each
          text's own rendered width blocks it, the same way the frame's own Rect fill already
          hides any arrow passing behind the box.

          Deliberately uses getTextWidth(text) here, not this.name.width()/this._globalNamesText
          .width(): those apply Config.TextMinWidth (30px) as a floor, which exists for binding
          key/value alignment elsewhere and has nothing to do with this text's actual rendered
          width. For a single short glyph (e.g. a one-letter function name) that floor is wider
          than Config.FramePaddingX (20px, the arrow's x-offset), so the padded-out rect would
          cover the arrow well past where the glyph's own ink ends — an oversized, unnecessary gap.
        */}
        <Rect
          {...ShapeDefaultProps}
          x={this.name.x()}
          y={this.name.y()}
          width={getTextWidth(this.name.partialStr)}
          height={this.name.height()}
          listening={false}
          strokeEnabled={false}
          key={Layout.key++}
          fill={defaultBackgroundColor()}
        />
        {this.name.draw()}
        {this._globalNamesText && (
          <Rect
            {...ShapeDefaultProps}
            x={this._globalNamesText.x()}
            y={this._globalNamesText.y()}
            width={getTextWidth(this._globalNamesText.partialStr)}
            height={this._globalNamesText.height()}
            listening={false}
            strokeEnabled={false}
            key={Layout.key++}
            fill={defaultBackgroundColor()}
          />
        )}
        {this._globalNamesText?.draw()}

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
