import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';

import { Config } from '../Config';
import ListVisualizer from '../ListVisualizer';
import { isEmptyList, isList, toText } from '../ListVisualizerUtils';
import { DataTreeNode, TreeNode } from '../tree/TreeNode';
import { NullDrawable } from './NullDrawable';

type ArrayProps = {
  nodes: (TreeNode | number)[];
};

/**
 *  Represents an array in a tree.
 */
export class ArrayDrawable extends React.PureComponent<ArrayProps> {
  render() {
    const createChildText = (node: DataTreeNode, index: number) => {
      const nodeValue = node.data;
      if (!isList(nodeValue)) {
        const textValue: string | undefined = toText(nodeValue);
        const textToDisplay = textValue ?? '*' + ListVisualizer.displaySpecialContent(node);
        return (
          <Text
            key={nodeValue + index}
            text={textToDisplay}
            align={'center'}
            width={Config.BoxWidth}
            x={Config.BoxWidth * index}
            y={Math.floor((Config.BoxHeight - 1.2 * 12) / 2)}
            fontStyle={textValue === undefined ? 'italic' : 'normal'}
            fill={'white'}
          />
        );
      } else if (isEmptyList(nodeValue)) {
        const props = {
          x: index * Config.BoxWidth,
          // x: isLeftNode ? -Config.BoxWidth * Config.VertBarPos : 0,
          y: 0
        };
        return <NullDrawable {...props} />;
      } else {
        return null;
      }
    };

    return (
      <Group>
        {/* Outer rectangle */}
        <Rect
          width={Config.BoxWidth * this.props.nodes.length}
          height={Config.BoxHeight}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          fill={'#17181A'}
        />
        {/* Vertical lines in the box */}
        {Array.from(Array(this.props.nodes.length - 1), (e, i) => {
          return (
            <Line
              key={'line' + i}
              points={[Config.BoxWidth * (i + 1), 0, Config.BoxWidth * (i + 1), Config.BoxHeight]}
              strokeWidth={Config.StrokeWidth}
              stroke={Config.Stroke}
            />
          );
        })}
        {this.props.nodes.map(
          (child, index) => child instanceof DataTreeNode && createChildText(child, index)
        )}
      </Group>
    );
  }
}
