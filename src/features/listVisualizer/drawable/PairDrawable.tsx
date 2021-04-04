import React from "react";

import { Group, Line, Rect, Text } from 'react-konva';

import { Config } from '../Config'
import { Data } from "../ListVisualizerTypes";
import { displaySpecialContent, isList, isNull, toText } from "../ListVisualizerUtils";
import { NodeDrawable } from "./NodeDrawable";
import { NullDrawable } from "./NullDrawable";

/**
 *  Represents a pair in a tree. It takes up to two data items.
 */
export class PairDrawable extends NodeDrawable {
    private leftData: Data | null;
    private rightData: Data | null;

    constructor(props: {leftData: Data | null, rightData: Data | null}) {
        super(props);
        this.leftData = props.leftData;
        this.rightData = props.rightData;
    }

    render() {
        const createChildText = (nodeValue: Data, isLeftNode: boolean) => {
            if (!isList(nodeValue)) {
                const textValue: string | undefined = toText(nodeValue);
                const textToDisplay = textValue ?? '*' + displaySpecialContent(nodeValue);
                return <Text
                    text={textToDisplay}
                    align={'center'}
                    width={Config.VertBarPos * Config.BoxWidth}
                    x={isLeftNode ? 0 : Config.VertBarPos * Config.BoxWidth}
                    y={Math.floor((Config.BoxHeight - 1.2 * 12) / 2)}
                    fontStyle={textValue === undefined ? 'italic' : 'normal'}
                    fill={'white'}/>;
            } else if (isNull(nodeValue)) {
                const props = {
                    x: isLeftNode ? -Config.BoxWidth * Config.VertBarPos : 0,
                    y: 0,
                };
                return <NullDrawable {...props}/>;
            }
        };

        return <Group>
            {/* Outer rectangle */}
            <Rect
                width={Config.BoxWidth}
                height={Config.BoxHeight}
                strokeWidth={Config.StrokeWidth}
                stroke={Config.Stroke}
                fill={'#17181A'}/>
            {/* Vertical line in the box */}
            <Line
                points={[Config.BoxWidth * Config.VertBarPos, 0, Config.BoxWidth * Config.VertBarPos, Config.BoxHeight]}
                strokeWidth={Config.StrokeWidth}
                stroke={Config.Stroke}/>
            {createChildText(this.leftData, true)}
            {createChildText(this.rightData, false)}
        </Group>;
    }
}