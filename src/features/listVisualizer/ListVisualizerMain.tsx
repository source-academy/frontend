import { Layer, Stage, Text } from "react-konva";

import { Data } from "./ListVisualizerTypes";
import { findDataHeight, findDataWidth, isFunction, isPair, toText } from "./ListVisualizerUtils";
import { Tree } from "./tree/Tree";
import { FunctionTreeNode } from "./tree/TreeNode";

// // A list of layers drawn, used for history
// let layerList = [];
// // ID of the current layer shown. Avoid changing this value externally as layer is not updated.
// let currentListVisualizer = -1;

// type Pane = {layer: JSX.Element, config: {width: number, height: number}};

export class ListVisualizerMain {
    clear() {
        // throw new Error('Method not implemented.');
    }

    public createDrawings(structures: Data[]): JSX.Element[] {
        const stages: JSX.Element[] = [];

        for (const structure of structures) {
            stages.push(this.createDrawing(structure));
        }

        return stages;
    }

    /**
     *  For student use. Draws a list by converting it into a tree object, attempts to draw on the canvas,
     *  Then shift it to the left end.
     */
    private createDrawing(xs: Data): JSX.Element {
        // Hides the default text
        // (document.getElementById('data-visualizer-default-text')).hidden = true;

        // Blink icon
        // const icon = document.getElementById('data_visualiser-icon');

        // if (icon) {
        //     icon.classList.add('side-content-tab-alert');
        // }

        /**
         * Create konva stage according to calculated width and height of drawing.
         * Theoretically, as each box is 90px wide and successive boxes overlap by half,
         * the width of the drawing should be roughly (width * 45), with a similar calculation
         * for height.
         * In practice, likely due to browser auto-scaling, for large drawings this results in
         * some of the drawing being cut off. Hence the width and height formulas used are approximations.
         */

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
                //  x={500}
                //  y={50}
                 fontStyle={'normal'}
                 fontSize={20}
                 fill={'white'}/>
            </Layer>
        }

        // update current ID
        // currentListVisualizer = layerList.length - 1;
        const stage = <Stage
            width = {findDataWidth(xs) * 60 + 60}
            height = {findDataHeight(xs) * 60 + 100}>
            {layer}
        </Stage>
        return stage;
    }
}


/**
 *  Shows the layer with a given ID while hiding the others.
 */
// function showListVisualizer(id) {
//     for (let i = 0; i < layerList.length; i++) {
//         layerList[i].hide();
//     }
//     if (layerList[id]) {
//         layerList[id].show();
//         currentListVisualizer = id;
//     }
// }

// function clearListVisualizer() {
//     currentListVisualizer = -1;
//     for (let i = 0; i < layerList.length; i++) {
//         layerList[i].hide();
//     }
//     layerList = [];
// }

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


