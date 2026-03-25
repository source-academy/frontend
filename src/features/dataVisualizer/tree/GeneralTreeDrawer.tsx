import Konva from 'konva';
import { n } from 'node_modules/react-router/dist/development/index-react-server-client-EzWJGpN_.mjs';
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
 * Tree drawer for general tree view
 */
export class GeneralTreeDrawer extends OriginalTreeDrawer {
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

    // NON-GENERAL TREE WARNING
    if (!DataVisualizer.isGenTree) {
      return (
        <Stage key={key} width={400} height={100}>
          <Layer>
            <Text
              text={'Render general tree only supports trees'}
              align="center"
              fontStyle="normal"
              fontSize={20}
              fill="red"
            />
          </Layer>
        </Stage>
      );
    }

    // RenderGeneralTree
    this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
    this.width = this.getNodeWidth(this.tree.rootNode) - this.minX;
    this.height = this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth;

    return (
      <Stage
        key={key}
        width={
          (Config.NWidth + Config.BoxWidth) * (DataVisualizer.longestNodePos + 1) -
          Config.BoxWidth +
          x * 2
        }
        height={this.downCOUNTER * Config.BoxHeight * 4 + Config.BoxHeight + y * 2}
      >
        <Layer key={x + ', ' + y} offsetX={0} offsetY={this.minY}>
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
      // RenderGeneralTree
      const drawable = node.createDrawable(x, y, parentX, parentY, node.nodeColor);
      this.drawables.push(drawable);

      const longest = DataVisualizer.nodeCount[0]; // e.g. 3
      this.runningX2 = (Config.NWidth + Config.BoxWidth) * (longest + 1);
      this.downCOUNTER = DataVisualizer.TreeDepth;

      node.children?.forEach((childNode, index) => {
        let myY;
        let myX;

        if (index == 0) {
          myY = y + Config.DistanceY * 2;
          myX = originX;
          OriginalTreeDrawer.colorCounter++;
          colorIndex = OriginalTreeDrawer.colorCounter;
        } else {
          myY = y;
          myX = x + Config.NWidth + Config.BoxWidth;
          colorIndex = parentIndex;
        }

        if (x > this.runningX2 && index == 0 && y == parentY + Config.DistanceY * 2) {
          // NEW right branches that stretch towards the right
          this.rightCOUNTER++;
          this.runningX2 = myX;
        }

        if (node.children![1] instanceof ArrayTreeNode) {
          if (node.children![1].children![0] instanceof ArrayTreeNode) {
            originIndex = node.children![1].children![0].nodePos;
            originX = 0 + this.leftMargin + (Config.NWidth + Config.BoxWidth) * originIndex;
          }
        }

        if (index == 0 && node.children![0] instanceof ArrayTreeNode) {
          if (node.children![0].children![0] instanceof ArrayTreeNode) {
            originIndex = node.children![0].children![0].nodePos;
            originX = 0 + this.leftMargin + (Config.NWidth + Config.BoxWidth) * originIndex;
          }
        }

        this.drawNode(
          childNode,
          myX,
          myY,
          x + Config.BoxWidth * index,
          y,
          colorIndex,
          colorIndex,
          originIndex,
          originX
        );
      });
    }
  }
}
