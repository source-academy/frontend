import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import CseMachine from '../../CseMachine';
import { CseAnimation } from '../../CseMachineAnimation';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { ArrowOriginFilterKey, IHoverable, IVisible, StepsArray } from '../../CseMachineTypes';
import { defaultStrokeColor, fadedStrokeColor } from '../../CseMachineUtils';
import { Visible } from '../Visible';
import { arrowSelection } from './ArrowSelection';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow<Source extends IVisible, Target extends IVisible>
  extends Visible
  implements IHoverable
{
  private _path: string = '';
  points: number[] = [];
  source: Source;
  target: Target | undefined;
  faded: boolean = false;
  protected _visible: boolean = true;
  private pathRef: RefObject<Konva.Path | null> = React.createRef();
  private sourceSegmentPathRef: RefObject<Konva.Path | null> = React.createRef();
  private sourceSegmentGroupRef: RefObject<Konva.Group | null> = React.createRef();
  private arrowHeadRef: RefObject<Konva.Arrow | null> = React.createRef();

  // Check if this arrow is selected
  protected isSelected(): boolean {
    return arrowSelection.isSelected(this);
  }

  // Select this arrow
  protected select(): void {
    arrowSelection.setSelected(this);
  }

  isLive: boolean = false; // Added to track if the arrow is live (an inherent property of the arrow)
  /*
   * The above is added since an arrow can in general be drawn between two points
   * that may or may not be a Frame. Hence, we cannot determine if the arrow is live
   * based on whether the source or target is a live Frame. Thus, we set this property
   * when we create the arrow
   */

  constructor(from: Source) {
    super();
    this.source = from;
    this.target = undefined;
    this._x = from.x();
    this._y = from.y();
    this.isLive = false; // default to false
  }

  private attachArrowRef = (node: Konva.Group | null) => {
    (this.ref as React.MutableRefObject<Konva.Group | null>).current = node;
  };

  path(): string {
    return this._path;
  }

  to(to: Target): GenericArrow<Source, Target> {
    this.target = to;
    this.recomputePath();
    return this;
  }

  private recomputePath(): void {
    if (!this.target) {
      this._path = '';
      this.points = [];
      return;
    }

    const to = this.target;
    this._x = this.source.x();
    this._y = this.source.y();
    this._width = Math.abs(to.x() - this.source.x());
    this._height = Math.abs(to.y() - this.source.y());

    const points = this.calculateSteps().reduce<Array<number>>(
      (acc, step) => [...acc, ...step(acc[acc.length - 2], acc[acc.length - 1])],
      [this.source.x(), this.source.y()]
    );
    points.splice(0, 2);

    // Remove no-op points so zero-length segments do not collapse rounded corners
    // or force the arrowhead to sit directly on a bend.
    for (let i = points.length - 2; i >= 2; i -= 2) {
      if (points[i] === points[i - 2] && points[i + 1] === points[i - 1]) {
        points.splice(i, 2);
      }
    }

    this._path = '';
    if (points.length < 4) {
      this.points = points;
      return;
    }

    // starting point
    this._path += `M ${points[0]} ${points[1]} `;
    if (points.length === 4) {
      // end the path if the line only has starting and ending coordinates
      this._path += `L ${points[2]} ${points[3]} `;
    } else {
      let n = 0;
      while (n < points.length - 4) {
        const [xa, ya, xb, yb, xc, yc] = points.slice(n, n + 6);
        const dx1 = xb - xa;
        const dx2 = xc - xb;
        const dy1 = yb - ya;
        const dy2 = yc - yb;
        const segment1Length = Math.abs(dx1) + Math.abs(dy1);
        const segment2Length = Math.abs(dx2) + Math.abs(dy2);
        const isLastCorner = n + 6 >= points.length;
        const minTerminalStraightLength = Math.max(
          Config.ArrowHeadSize,
          Config.ArrowMinCornerRadius
        );
        const terminalAllowance = isLastCorner
          ? Math.max(0, segment2Length - minTerminalStraightLength)
          : segment2Length / 2;
        const maxSpaceRadius = Math.min(segment1Length / 2, segment2Length / 2, terminalAllowance);
        const desiredRadius = Math.min(
          Config.ArrowCornerRadius,
          maxSpaceRadius * Config.ArrowSmallBendRadiusScale
        );
        const br =
          maxSpaceRadius >= Config.ArrowMinCornerRadius
            ? Math.max(Config.ArrowMinCornerRadius, desiredRadius)
            : Math.max(0, maxSpaceRadius);
        const x1 = xb - br * Math.sign(dx1);
        const y1 = yb - br * Math.sign(dy1);
        const x2 = xb + br * Math.sign(dx2);
        const y2 = yb + br * Math.sign(dy2);

        // draw quadratic curves over corners
        this._path += `L ${x1} ${y1} Q ${xb} ${yb} ${x2} ${y2} `;
        n += 2;
      }
    }
    // end path
    this._path += `L ${points[points.length - 2]} ${points[points.length - 1]} `;
    this.points = points;
  }

  /**
   * Calculates the steps that this arrows takes.
   * The arrow is decomposed into numerous straight line segments, each of which we
   * can consider as a step of dx in the x direction and of dy in the y direction.
   * The line segment is thus defined by 2 points (x, y) and (x + dx, y + dy)
   * where (x, y) is the ending coordinate of the previous line segment.
   * This function returns an array of such steps, represented by an array of functions
   *  [ (x, y) => [x + dx1, y + dy1], (x, y) => [x + dx2, y + dy2], ... ].
   * From this, we can retrieve the points that make up the arrow as such:
   * (from.x from.y), (from.x + dx1, from.y + dy1), (from.x + dx1 + dx2, from.y + dy1 + dy2), ..
   *
   * Note that the functions need not be of the form (x, y) => [x + dx, y + dy];
   * (x, y) => [to.x, to.y] is valid as well, and is used to specify a step to the ending coordinates
   *
   * @return an array of steps represented by functions
   */
  protected calculateSteps(): StepsArray {
    const to = this.target;
    if (!to) return [];
    return [() => [to.x(), to.y()]];
  }

  /**
   * Returns the hover color for this arrow type.
   * Subclasses can override this to provide custom hover colors.
   */
  protected getHighlightedColor(): string {
    if (CseMachine.getPrintableMode()) {
      return Config.PrintDangerColor;
    }
    return this.isLive ? Config.ArrowHighlightedColor : Config.ArrowDeadHighlightedColor;
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    this.ref.current?.moveToTop();
    this.setHighlightedStyle();
    this.ref.current?.getStage()?.batchDraw();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;

    // Don't change color if selected
    if (this.isSelected()) {
      return;
    }

    this.setNormalStyle();
    this.ref.current?.getStage()?.batchDraw();
  };

  public setHighlightedStyle() {
    const highlightColor = this.getHighlightedColor();
    if (this.pathRef.current) {
      this.pathRef.current.stroke(highlightColor);
      this.pathRef.current.strokeWidth(Config.ArrowHoveredStrokeWidth);
    }
    if (this.sourceSegmentPathRef.current) {
      this.sourceSegmentPathRef.current.stroke(highlightColor);
      this.sourceSegmentPathRef.current.strokeWidth(Config.ArrowHoveredStrokeWidth);
    }
    if (this.arrowHeadRef.current) {
      this.arrowHeadRef.current.fill(highlightColor);
      this.arrowHeadRef.current.pointerWidth(Config.ArrowHoveredHeadSize);
      this.arrowHeadRef.current.pointerLength(Config.ArrowHoveredHeadSize);
    }
    this.source.setArrowSourceHighlightedStyle?.();
    this.target?.setArrowSourceHighlightedStyle?.();
  }
  public setNormalStyle() {
    const color = this.isLive ? defaultStrokeColor() : fadedStrokeColor();
    if (this.pathRef.current) {
      this.pathRef.current.stroke(color);
      this.pathRef.current.strokeWidth(Config.ArrowStrokeWidth);
    }
    if (this.sourceSegmentPathRef.current) {
      this.sourceSegmentPathRef.current.stroke(color);
      this.sourceSegmentPathRef.current.strokeWidth(Config.ArrowStrokeWidth);
    }
    if (this.arrowHeadRef.current) {
      this.arrowHeadRef.current.fill(color);
      this.arrowHeadRef.current.pointerWidth(Config.ArrowHeadSize);
      this.arrowHeadRef.current.pointerLength(Config.ArrowHeadSize);
    }
    this.source.setArrowSourceNormalStyle?.();
    this.target?.setArrowSourceNormalStyle?.();
  }

  onClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;

    // Toggle selection - clear first, then select if it wasn't already selected
    const wasSelected = this.isSelected();
    const oldArrow = arrowSelection.clearSelection();

    // Update old arrow's visual state
    if (oldArrow && oldArrow !== this) {
      oldArrow.setNormalStyle();
    }

    if (!wasSelected) {
      this.select();
      this.setHighlightedStyle();
    } else {
      this.setNormalStyle();
    }

    this.ref.current?.getStage()?.batchDraw();
  };

  onContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault(); // Prevent browser context menu
    this.onClick(e);
  };

  protected getCurrentColor(): string {
    if (this.isSelected()) {
      return this.getHighlightedColor(); // Selected uses hover color
    }
    return this.faded ? fadedStrokeColor() : defaultStrokeColor();
  }

  /** Subclasses can disable all pointer interactions for passive arrows. */
  protected isInteractive(): boolean {
    return true;
  }

  /** Subclasses can classify arrow origin for filter UI. */
  protected getOriginFilterKey(): ArrowOriginFilterKey | null {
    return null;
  }

  /** Optional source frame bounds used to draw a visible segment above the frame. */
  protected getSourceFrameBounds(): { x: number; y: number; width: number; height: number } | null {
    return null;
  }

  private drawSourceFrameSegment(stroke: string, interactive: boolean): React.ReactNode {
    const rect = this.getSourceFrameBounds();
    if (!rect || !this.path()) return null;

    return (
      <KonvaGroup
        ref={this.sourceSegmentGroupRef}
        key={Layout.key++}
        clipX={rect.x}
        clipY={rect.y}
        clipWidth={rect.width}
        clipHeight={rect.height}
        visible={this._visible}
        listening={interactive}
      >
        <KonvaPath
          {...ShapeDefaultProps}
          key={Layout.key++}
          ref={this.sourceSegmentPathRef}
          data={this.path()}
          stroke={stroke}
          strokeWidth={this.isSelected() ? Config.ArrowHoveredStrokeWidth : Config.ArrowStrokeWidth}
          listening={interactive}
          onMouseEnter={interactive ? this.onMouseEnter : undefined}
          onMouseLeave={interactive ? this.onMouseLeave : undefined}
          onClick={interactive ? this.onClick : undefined}
          onContextMenu={interactive ? this.onContextMenu : undefined}
          onMouseDown={interactive ? e => (e.cancelBubble = true) : undefined}
        />
      </KonvaGroup>
    );
  }

  setVisible(visible: boolean): void {
    this._visible = visible;
    if (visible) {
      this.ref.current?.show();
      this.sourceSegmentGroupRef.current?.show();
    } else {
      this.ref.current?.hide();
      this.sourceSegmentGroupRef.current?.hide();
    }
    this.ref.current?.getStage()?.batchDraw();
  }

  // Subclasses can override to recompute liveness before drawing
  protected updateIsLive(): void {} //kind of an abstract method

  draw() {
    this.recomputePath();
    this.updateIsLive(); //just before drawijng, update liveness for the arrows (since this was causing erroes earlier  )
    if (CseAnimation.shouldHideReferenceArrows()) {
      return null;
    }
    if (Layout.clearDeadFrames && !this.isLive) {
      return null;
    }
    if (!CseMachine.isArrowOriginVisible(this.getOriginFilterKey())) {
      return null;
    }

    const stroke = this.isLive ? defaultStrokeColor() : fadedStrokeColor();

    const interactive = this.isInteractive();

    Layout.registerUnderlayArrow(
      <KonvaGroup
        key={Layout.key++}
        ref={this.attachArrowRef}
        name="cse-arrow-underlay-node"
        visible={this._visible}
        listening={interactive}
        onMouseEnter={interactive ? this.onMouseEnter : undefined}
        onMouseLeave={interactive ? this.onMouseLeave : undefined}
        onClick={interactive ? this.onClick : undefined}
        onContextMenu={interactive ? this.onContextMenu : undefined}
        onMouseDown={interactive ? e => (e.cancelBubble = true) : undefined}
      >
        <KonvaPath
          {...ShapeDefaultProps}
          ref={this.pathRef}
          stroke={stroke}
          strokeWidth={this.isSelected() ? Config.ArrowHoveredStrokeWidth : Config.ArrowStrokeWidth}
          data={this.path()}
          key={Layout.key++}
          hitStrokeWidth={10}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          ref={this.arrowHeadRef}
          points={this.points.slice(this.points.length - 4)}
          fill={stroke}
          strokeEnabled={false}
          pointerWidth={this.isSelected() ? Config.ArrowHoveredHeadSize : Config.ArrowHeadSize}
          key={Layout.key++}
        />
      </KonvaGroup>
    );

    return this.drawSourceFrameSegment(stroke, interactive);
  }
}
