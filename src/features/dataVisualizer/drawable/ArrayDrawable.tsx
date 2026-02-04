import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';

import { Config } from '../Config';
import DataVisualizer from '../dataVisualizer';
import { isEmptyList, isList, toText } from '../dataVisualizerUtils';
import { DataTreeNode, TreeNode } from '../tree/TreeNode';
import { NullDrawable } from './Drawable';

type ArrayProps = {
  nodes: TreeNode[];
  x: number;
  y: number;
};

/**
 *  Represents an array in a tree.
 */
class ArrayDrawable extends React.PureComponent<ArrayProps> {
  render() {
    const createChildText = (node: DataTreeNode, index: number) => {
      const nodeValue = node.data;
      if (!isList(nodeValue)) {
        const textValue: string | undefined = toText(nodeValue);
        const textToDisplay = textValue ?? '*' + DataVisualizer.displaySpecialContent(node);
        return (
          <Text
            key={'' + nodeValue + index}
            text={textToDisplay}
            align="center"
            width={Config.BoxWidth}
            x={Config.BoxWidth * index}
            y={Math.floor((Config.BoxHeight - 1.2 * 12) / 2)}
            fontStyle={textValue === undefined ? 'italic' : 'normal'}
            fill="white"
            preventDefault={false}
          />
        );
      } else if (isEmptyList(nodeValue)) {
        const props = {
          x: index * Config.BoxWidth,
          y: 0
        };
        return <NullDrawable key={index} {...props} />;
      } else {
        return null;
      }
    };

    return (
      <Group x={this.props.x} y={this.props.y}>
        {/* Outer rectangle */}
        <Rect
          width={Math.max(Config.BoxWidth * this.props.nodes.length, Config.BoxMinWidth)}
          height={Config.BoxHeight}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          fill="#17181A"
          preventDefault={false}
        />
        {/* Vertical lines in the box */}
        {this.props.nodes.length > 1 &&
          Array.from(Array(this.props.nodes.length - 1), (e, i) => {
            return (
              <Line
                key={'line' + i}
                points={[Config.BoxWidth * (i + 1), 0, Config.BoxWidth * (i + 1), Config.BoxHeight]}
                strokeWidth={Config.StrokeWidth}
                stroke={Config.Stroke}
                preventDefault={false}
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

export default ArrayDrawable;
