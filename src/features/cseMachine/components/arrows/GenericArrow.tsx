import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IHoverable, IVisible, StepsArray } from '../../CseMachineTypes';
import { defaultStrokeColor, fadedStrokeColor } from '../../CseMachineUtils';
import { Visible } from '../Visible';
import { arrowSelection } from './ArrowSelection';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow<Source extends IVisible, Target extends IVisible> extends Visible implements IHoverable {
  private _path: string = '';
  points: number[] = [];
  source: Source;
  target: Target | undefined;
  faded: boolean = false;
  private pathRef: RefObject<Konva.Path> = React.createRef();
  private arrowHeadRef: RefObject<Konva.Arrow> = React.createRef();

  // Check if this arrow is selected
  protected isSelected(): boolean {
    return arrowSelection.isSelected(this);
  }

  // Select this arrow
  protected select(): void {
    arrowSelection.setSelected(this);
  }

  // Deselect (static, can be called from anywhere)
  public static clearSelection(): GenericArrow<IVisible, IVisible> | null {
    return arrowSelection.clearSelection();
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

  path(): string {
    return this._path;
  }

  to(to: Target): GenericArrow<Source, Target> {
    this.target = to;
    this._width = Math.abs(to.x() - this.source.x());
    this._height = Math.abs(to.y() - this.source.y());

    const points = this.calculateSteps().reduce<Array<number>>(
      (points, step) => [...points, ...step(points[points.length - 2], points[points.length - 1])],
      [this.source.x(), this.source.y()]
    );
    points.splice(0, 2);

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
        const br = Math.min(
          Config.ArrowCornerRadius,
          Math.max(Math.abs(dx1), Math.abs(dy1)) / 2,
          Math.max(Math.abs(dx2), Math.abs(dy2)) / 2
        );
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
    return this;
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
  protected getHighlightColour(): string {
    return Config.ArrowHighlightedColor;
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    e.cancelBubble = true;
    this.setHighlightedStyle();
    // Move entire arrow group to top
    if (this.ref.current && this.ref.current.moveToTop) {
      // Move the arrow's parent container to top first, then move arrow within that
      const parent = this.ref.current.getParent();
      if (parent && parent.moveToTop) {
        parent.moveToTop();
      }
      this.ref.current.moveToTop();
    }
    this.ref.current?.getLayer()?.batchDraw();
  }

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    e.cancelBubble = true;

    // Don't change color if selected
    if (this.isSelected()) {
      return;
    }

    this.setNormalStyle();
    this.ref.current?.getLayer()?.batchDraw();
  }

  public setHighlightedStyle() {
    const highlightColor = this.getHighlightColour();
    if (this.pathRef.current) {
      this.pathRef.current.stroke(highlightColor);
      this.pathRef.current.strokeWidth(Config.ArrowHoveredStrokeWidth);
    }
    if (this.arrowHeadRef.current) {
      this.arrowHeadRef.current.fill(highlightColor);
      this.arrowHeadRef.current.pointerWidth(Config.ArrowHoveredHeadSize);
      this.arrowHeadRef.current.pointerLength(Config.ArrowHoveredHeadSize);
    }
  }

  public setNormalStyle() {
    const color = this.faded ? fadedStrokeColor() : defaultStrokeColor();
    if (this.pathRef.current) {
      this.pathRef.current.stroke(color);
      this.pathRef.current.strokeWidth(Config.ArrowStrokeWidth);
    }
    if (this.arrowHeadRef.current) {
      this.arrowHeadRef.current.fill(color);
      this.arrowHeadRef.current.pointerWidth(Config.ArrowHeadSize);
      this.arrowHeadRef.current.pointerLength(Config.ArrowHeadSize);
    }
  }

  onClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;

    // Toggle selection - clear first, then select if it wasn't already selected
    const wasSelected = this.isSelected();
    const oldArrow = GenericArrow.clearSelection();

    // Update old arrow's visual state
    if (oldArrow && oldArrow !== this) {
      oldArrow.setNormalStyle();
    }

    if (!wasSelected) {
      this.select();
      // Update this arrow's visual state
      this.setHighlightedStyle();
    }

    // Force redraw entire layer to update all arrows
    this.ref.current?.getLayer()?.batchDraw();
  }

  onContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault(); // Prevent browser context menu
    this.onClick(e);
  }

  protected getCurrentColor(): string {
    if (this.isSelected()) {
      return this.getHighlightColour(); // Selected uses hover color
    }
    return this.faded ? fadedStrokeColor() : defaultStrokeColor();
  }

  

    
  // Subclasses can override to recompute liveness before drawing
  protected updateIsLive(): void {} //kind of an abstract method

  draw() {
    
    this.updateIsLive(); //just before drawijng, update liveness for the arrows (since this was causing erroes earlier  )
    const stroke = this.isLive ? defaultStrokeColor() : fadedStrokeColor();

    return (
      <KonvaGroup
        key={Layout.key++}
        ref={this.ref}
        listening={true}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        onMouseDown={(e) => e.cancelBubble = true}
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
  }
}
