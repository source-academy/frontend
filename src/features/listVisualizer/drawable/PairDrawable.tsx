import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';

import { Config } from '../Config'
import ListVisualizer from '../ListVisualizer';
import { isList, isNull, toText } from "../ListVisualizerUtils";
import { DataTreeNode } from '../tree/DataTreeNode';
import { NullDrawable } from "./NullDrawable";

/**
 *  Represents a pair in a tree. It takes up to two data items.
 */
export class PairDrawable extends React.Component {
    private leftNode: DataTreeNode | null;
    private rightNode: DataTreeNode | null;

    constructor(props: { leftNode: DataTreeNode | null, rightNode: DataTreeNode | null }) {
        super(props);
        this.leftNode = props.leftNode;
        this.rightNode = props.rightNode;
    }

    render() {
        const createChildText = (node: DataTreeNode | null, isLeftNode: boolean) => {
            if (node == null) {
                return null;
            }
            const nodeValue = node.data;
            if (!isList(nodeValue)) {
                console.log(nodeValue)
                const textValue: string | undefined = toText(nodeValue);
                const textToDisplay = textValue ?? '*' + ListVisualizer.displaySpecialContent(node);
                return <Text
                    text={textToDisplay}
                    align={'center'}
                    width={Config.VertBarPos * Config.BoxWidth}
                    x={isLeftNode ? 0 : Config.VertBarPos * Config.BoxWidth}
                    y={Math.floor((Config.BoxHeight - 1.2 * 12) / 2)}
                    fontStyle={textValue === undefined ? 'italic' : 'normal'}
                    fill={'white'} />;
            } else if (isNull(nodeValue)) {
                const props = {
                    x: isLeftNode ? -Config.BoxWidth * Config.VertBarPos : 0,
                    y: 0,
                };
                return <NullDrawable {...props} />;
            } else {
                return null;
            }
        };

        return <Group>
            {/* Outer rectangle */}
            <Rect
                width={Config.BoxWidth}
                height={Config.BoxHeight}
                strokeWidth={Config.StrokeWidth}
                stroke={Config.Stroke}
                fill={'#17181A'} />
            {/* Vertical line in the box */}
            <Line
                points={[Config.BoxWidth * Config.VertBarPos, 0, Config.BoxWidth * Config.VertBarPos, Config.BoxHeight]}
                strokeWidth={Config.StrokeWidth}
                stroke={Config.Stroke} />
            {createChildText(this.leftNode, true)}
            {createChildText(this.rightNode, false)}
        </Group>;
    }
}