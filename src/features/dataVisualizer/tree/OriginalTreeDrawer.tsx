import Konva from 'konva';
import type { JSX } from 'react';
import { Layer, Stage, Text } from 'react-konva';

import { Config } from '../Config';
import { Data } from '../dataVisualizerTypes';
import { toText } from '../dataVisualizerUtils';
import { ArrowDrawable, BackwardArrowDrawable } from '../drawable/Drawable';
import { AlreadyParsedTreeNode } from './AlreadyParsedTreeNode';
import { Tree } from './Tree';
import {
  ArrayTreeNode,
  DataTreeNode,
  DrawableTreeNode,
  FunctionTreeNode,
  TreeNode
} from './TreeNode';

/**
 * Base tree drawer for original view
 */
export class OriginalTreeDrawer {
  protected tree: Tree;
  public leftCOUNTER: number = 0;
  public rightCOUNTER: number = 0;
  public downCOUNTER: number = 0;
  protected runningX: number = 0;
  protected runningY: number = 0;
  protected runningX2: number = 0; // for rightCOUNTER

  protected drawables: JSX.Element[];
  protected nodeWidths: Map<TreeNode, number>;
  public width: number = 0;
  public height: number = 0;

  // Used to account for backward arrow
  protected minX = 0;
  protected minY = 0;
  public static colorCounter = 0;

  protected leftMargin: number = Config.StrokeWidth / 2;
  protected topMargin: number = Config.StrokeWidth / 2;

  constructor(tree: Tree) {
    this.tree = tree;
    this.drawables = [];
    this.nodeWidths = new Map();
  }

  /**
   * Draws a tree at x, y, by calling drawNode on the root at x, y.
   */
  draw(x: number, y: number, key: number): JSX.Element {
    if (this.tree.rootNode instanceof DataTreeNode) {
      const text = toText(this.tree.rootNode.data);
      const textConfig = {
        text: text,
        align: 'center',
        fontStyle: 'normal',
        fontSize: 20,
        fill: Config.Stroke
      };
      const konvaText = new Konva.Text(textConfig);
      this.width = konvaText.width();
      this.height = konvaText.height();
      return (
        <Stage key={key} width={this.width + x} height={this.height + y}>
          <Layer>
            <Text {...textConfig} />
          </Layer>
        </Stage>
      );
    }

    // OriginalView
    this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
    this.width = this.getNodeWidth(this.tree.rootNode) - this.minX;
    this.height = this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth;

    return (
      <Stage key={key} width={this.width + this.leftMargin} height={this.height + this.topMargin}>
        <Layer key={x + ', ' + y} offsetX={this.minX} offsetY={this.minY}>
          {this.drawables}
        </Layer>
      </Stage>
    );
  }

  /**
   * Draws the box for the pair representing the tree, then recursively draws its children.
   * A slash is drawn for empty lists.
   *
   * If a child node has been drawn previously, an arrow is drawn pointing to the children,
   * instead of drawing the child node again.
   */
  protected drawNode(
    node: TreeNode,
    x: number,
    y: number,
    parentX: number,
    parentY: number,
    colorIndex: number,
    parentIndex: number,
    originIndex: number,
    originX: number
  ) {
    if (node instanceof AlreadyParsedTreeNode) {
      // if its child is part of a cycle and it's been drawn, link back to that node instead
      const drawnNode = node.actualNode;
      const arrowProps = {
        from: {
          x: parentX + Config.BoxWidth / 2,
          y: parentY + Config.BoxHeight / 2
        },
        to: {
          x: drawnNode.drawableX!,
          y: drawnNode.drawableY!
        }
      };

      const isBackwardArrow = arrowProps.from.y >= arrowProps.to.y;

      let arrow: JSX.Element;

      if (isBackwardArrow) {
        // Update the minX and minY, in case overflow to the top or left happens
        this.minX = Math.min(
          this.minX,
          drawnNode.drawableX! - Config.ArrowMarginHorizontal - Config.StrokeWidth / 2
        );
        this.minY = Math.min(
          this.minY,
          drawnNode.drawableY! - Config.ArrowMarginTop - Config.StrokeWidth / 2
        );
        arrow = (
          <BackwardArrowDrawable key={'Arrow (back)' + parentX + x + parentY + y} {...arrowProps} />
        );
      } else {
        arrow = <ArrowDrawable key={'Arrow' + parentX + x + parentY + y} {...arrowProps} />;
      }
      this.drawables.push(arrow);
    }

    if (!(node instanceof DrawableTreeNode)) return;

    // draws the content
    if (node instanceof FunctionTreeNode) {
      const drawable = node.createDrawable(x, y, parentX, parentY, -1);
      this.drawables.push(drawable);
    } else if (node instanceof ArrayTreeNode) {
      // OriginalView
      const drawable = node.createDrawable(x, y, parentX, parentY, -1);
      this.drawables.push(drawable);
      let leftX = x;
      node.children?.forEach((childNode, index) => {
        const childY = childNode instanceof AlreadyParsedTreeNode ? y : y + Config.DistanceY;
        this.drawNode(childNode, leftX, childY, x + Config.BoxWidth * index, y, 0, 0, 0, 0);
        const childNodeWidth = this.getNodeWidth(childNode);
        leftX += childNodeWidth ? childNodeWidth + Config.DistanceX : 0;
      });
    }
  }

  /**
   * Returns the width taken up by the node in pixels.
   */
  protected getNodeWidth(node: TreeNode): number {
    if (node instanceof DataTreeNode || node instanceof AlreadyParsedTreeNode) {
      return 0;
    } else if (node instanceof FunctionTreeNode) {
      return Config.CircleRadiusLarge * 4 + 2 * Config.StrokeWidth;
    } else if (node instanceof ArrayTreeNode) {
      if (this.nodeWidths.has(node)) {
        return this.nodeWidths.get(node) ?? 0;
      } else if (node.children != null) {
        const childrenWidths = node.children
          .map(node => this.getNodeWidth(node))
          .filter(x => x > 0);
        const childrenWidth =
          childrenWidths.length > 0 ? childrenWidths.reduce((x, y) => x + y + Config.DistanceX) : 0;
        const nodeWidth = Math.max(
          node.children.length * Config.BoxWidth + Config.StrokeWidth,
          childrenWidth,
          Config.BoxMinWidth + Config.StrokeWidth
        );
        this.nodeWidths.set(node, nodeWidth);
        return nodeWidth;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  /**
   * Returns the height taken up by the node in pixels.
   */
  protected getNodeHeight(node: TreeNode): number {
    if (node instanceof DataTreeNode) {
      return 0;
    } else if (node instanceof FunctionTreeNode) {
      return Config.BoxHeight;
    } else if (node instanceof AlreadyParsedTreeNode) {
      return Config.ArrowMarginBottom;
    } else if (node instanceof ArrayTreeNode) {
      // Height of array node is BoxHeight + StrokeWidth / 2 + max(childrenHeights)
      return (
        (node.children ?? [])
          .map(child => {
            const childHeight = this.getNodeHeight(child);
            return childHeight + (child instanceof DrawableTreeNode ? Config.DistanceY / 2 : 0);
          })
          .filter(height => height > 0)
          .reduce((x, y) => Math.max(x, y), 0) + Config.BoxHeight
      );
    } else {
      return 0;
    }
  }
}
