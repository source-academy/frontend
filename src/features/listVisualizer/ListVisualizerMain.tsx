import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";

import { isFunction, isNull, isPair, toText } from "./ListVisualizerUtils";
import { Tree } from "./tree/Tree";
import { FunctionTreeNode } from "./tree/TreeNode";

// A list of layers drawn, used for history
let layerList = [];
// ID of the current layer shown. Avoid changing this value externally as layer is not updated.
let currentListVisualizer = -1;

export class ListVisualizerMain {
    constructor() {
        /**
         * Setup Stage
         */
        this.container = document.createElement('div');
        this.container.id = 'list-visualizer-container';
        this.container.hidden = true;
    }
    container;
    /**
     *  For student use. Draws a list by converting it into a tree object, attempts to draw on the canvas,
     *  Then shift it to the left end.
     */
    draw(xs) {
        // Hides the default text
        (document.getElementById('data-visualizer-default-text')).hidden = true;

        // Blink icon
        const icon = document.getElementById('data_visualiser-icon');

        if (icon) {
            icon.classList.add('side-content-tab-alert');
        }

        /**
         * Create konva stage according to calculated width and height of drawing.
         * Theoretically, as each box is 90px wide and successive boxes overlap by half,
         * the width of the drawing should be roughly (width * 45), with a similar calculation
         * for height.
         * In practice, likely due to browser auto-scaling, for large drawings this results in
         * some of the drawing being cut off. Hence the width and height formulas used are approximations.
         */

        // minLeft = 500;
        // nodeLabel = 0;
        // hides all other layers
        // for (let i = 0; i < layerList.length; i++) {
        //     layerList[i].hide();
        // }
        // // creates a new layer and add to the stage
        // const layer = new Layer();
        // stage.add(layer);
        // layerList.push(layer);
        let layer: JSX.Element;

        if (isPair(xs)) {
            layer = Tree.fromSourceTree(xs).draw(500, 50);
        } else if (isFunction(xs)) {
            layer = <Layer>
                {new FunctionTreeNode(0).getDrawable(50, 50, 50, 50)}
            </Layer>
        } else {
            layer = <Layer>
                <Text
                 text={toText(xs, true)}
                 align={'center'}
                 x={500}
                 y={50}
                 fontStyle={'normal'}
                 fontSize={20}
                 fill={'white'}/>
            </Layer>
        }

        // update current ID
        // currentListVisualizer = layerList.length - 1;
        const stage = <Stage
            width = {findListWidth(xs) * 60 + 60}
            height = {findListHeight(xs) * 60 + 100}>
                <Layer>
                    <Text
                        text="bro"
                        align='center'
                        fontStyle='normal'
                        fontSize={20}
                        fill="white">
                    </Text>
                </Layer>
        </Stage>
        return stage;
    }
}


/**
 *  Shows the layer with a given ID while hiding the others.
 */
function showListVisualizer(id) {
    for (let i = 0; i < layerList.length; i++) {
        layerList[i].hide();
    }
    if (layerList[id]) {
        layerList[id].show();
        currentListVisualizer = id;
    }
}

function clearListVisualizer() {
    currentListVisualizer = -1;
    for (let i = 0; i < layerList.length; i++) {
        layerList[i].hide();
    }
    layerList = [];
}

/**
 * Find the height of a drawing (in number of "rows" of pairs)
 */
function findListHeight(xs) {
    // Store pairs/arrays that were traversed previously so as to not double-count their height.
    const existing = [];

    function helper(xs) {
        if ((!isPair(xs) && !isFunction(xs)) || isNull(xs)) {
            return 0;
        } else {
            let leftHeight;
            let rightHeight;
            if (existing.includes(xs[0])
                || (!isPair(xs[0]) && !isFunction(xs[0]))) {
                leftHeight = 0;
            } else {
                existing.push(xs[0]);
                leftHeight = helper(xs[0]);
            }
            if (existing.includes(xs[1])
                || (!isPair(xs[1]) && !isFunction(xs[1]))) {
                rightHeight = 0;
            } else {
                existing.push(xs[1]);
                rightHeight = helper(xs[1]);
            }
            return leftHeight > rightHeight
                ? 1 + leftHeight
                : 1 + rightHeight;
        }
    }

    return helper(xs);
}

/**
 * Find the width of a drawing (in number of "columns" of pairs)
 */
function findListWidth(xs) {
    const existing = [];

    function helper(xs) {
        if ((!isPair(xs) && !isFunction(xs)) || isNull(xs)) {
            return 0;
        } else {
            let leftWidth;
            let rightWidth;
            if (existing.includes(xs[0])
                || (!isPair(xs[0]) && !isFunction(xs[0]))) {
                leftWidth = 0;
            } else {
                existing.push(xs[0]);
                leftWidth = helper(xs[0]);
            }
            if (existing.includes(xs[1])
                || (!isPair(xs[1]) && !isFunction(xs[1]))) {
                rightWidth = 0;
            } else {
                existing.push(xs[1]);
                rightWidth = helper(xs[1]);
            }
            return leftWidth + rightWidth + 1;
        }
    }

    return helper(xs);
}

// exports.draw = draw;
// exports.ListVisualizer = {
//     draw: draw,
//     clear: clearListVisualizer,
//     init: function (parent) {
//         container.hidden = false;
//         parent.appendChild(container);
//     },
//     next: function () {
//         if (currentListVisualizer > 0) {
//             currentListVisualizer--;
//         }
//         showListVisualizer(currentListVisualizer);
//     },
//     previous: function () {
//         if (currentListVisualizer > 0) {
//             currentListVisualizer--;
//         }
//         showListVisualizer(currentListVisualizer);
//     }
// };


