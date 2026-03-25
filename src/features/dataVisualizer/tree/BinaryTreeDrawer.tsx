import Konva from 'konva';
import type { JSX } from 'react';
import { Layer, Stage, Text } from 'react-konva';

import { Config } from '../Config';
import DataVisualizer from '../dataVisualizer';
import { toText } from '../dataVisualizerUtils';
import { ArrowDrawable, BackwardArrowDrawable } from '../drawable/Drawable';
import { AlreadyParsedTreeNode } from './AlreadyParsedTreeNode';
import { OriginalTreeDrawer } from './OriginalTreeDrawer';
import {
  ArrayTreeNode,
  DataTreeNode,
  DrawableTreeNode,
  FunctionTreeNode,
  TreeNode
} from './TreeNode';

/**
 * Tree drawer for binary tree view
 */
export class BinaryTreeDrawer extends OriginalTreeDrawer {
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

    // NON-BINARY TREE WARNING
    if (!DataVisualizer.isBinTree) {
      return (
        <Stage key={key} width={400} height={100}>
          <Layer>
            <Text
              text={'Render binary tree only supports binary trees'}
              align="center"
              fontStyle="normal"
              fontSize={20}
              fill="red"
            />
          </Layer>
        </Stage>
      );
    }

    // RenderBinaryTree
    this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
    this.width = this.getNodeWidth(this.tree.rootNode) - this.minX;
    this.height = this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth;

    const EY1 = Math.max(this.leftCOUNTER, this.rightCOUNTER);
    let EY2;
    if (EY1 === 0) {
      EY2 = EY1;
    } else {
      EY2 = 2 * (Math.pow(2, EY1 - 1) - 1) + 1; // how many nodegroups stretch left or right (not including root)
    }
    return (
      <Stage
        key={key}
        width={EY2 * Config.NWidth * 2 + x * 2 + Config.NWidth}
        height={
          (this.downCOUNTER - 1) * Config.DistanceY * 2 +
          (this.downCOUNTER - 1) * Config.BoxHeight * 2 +
          Config.BoxHeight * 3 +
          y * 2
        }
      >
        <Layer key={x + ', ' + y} offsetX={-(EY2 * Config.NWidth)} offsetY={this.minY}>
          {this.drawables}
        </Layer>
      </Stage>
    );
  }

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
      const drawable = node.createDrawable(x, y, parentX, parentY, 0);
      this.drawables.push(drawable);
    } else if (node instanceof ArrayTreeNode) {
      // RenderBinaryTree
      const drawable = node.createDrawable(x, y, parentX, parentY, node.nodeColor);
      this.drawables.push(drawable);

      node.children?.forEach((childNode, index) => {
        let myY;
        let myX;
        let scalerV = Math.round(
          Math.pow(2, DataVisualizer.TreeDepth) /
            Math.pow(2, Math.round(y / (6 * Config.BoxHeight)))
        );
        scalerV--;

        if (index === 0 && y === parentY + Config.DistanceY) {
          // NEW left branch
          myY = y + Config.DistanceY * 2;
          myX = x - Config.NWidth * scalerV;
          OriginalTreeDrawer.colorCounter++;
          colorIndex = OriginalTreeDrawer.colorCounter;
        } else if (index === 0) {
          // NEW right branch
          myY = y + Config.DistanceY * 2;
          myX = x + Config.NWidth * scalerV;
          colorIndex = OriginalTreeDrawer.colorCounter;
        } else if (y === parentY + Config.DistanceY) {
          // third box
          myY = y;
          myX = x + Config.NWidth * 2;
          colorIndex = parentIndex;
        } else {
          // second box
          myY = y + Config.DistanceY;
          myX = x - Config.NWidth;
          colorIndex = parentIndex;
        }

        if (x < this.runningX && index === 0 && y === parentY + Config.DistanceY) {
          // NEW left branches that stretch towards the left
          this.leftCOUNTER++;
          this.runningX = myX;
        } else if (x > this.runningX2 && index === 0 && y === parentY + Config.DistanceY) {
          // NEW right branches that stretch towards the right
          this.rightCOUNTER++;
          this.runningX2 = myX;
        }

        if (y > this.runningY && index === 0) {
          // NEW branches (doesn't matter left or right) that stretches down
          this.downCOUNTER++;
          this.runningY = myY;
        }

        this.drawNode(
          childNode,
          myX,
          myY,
          x + Config.BoxWidth * index,
          y,
          colorIndex,
          colorIndex,
          0,
          0
        );
      });
    }
  }
}
