import { Data } from "../ListVisualizerTypes";
import { TreeNode } from "./TreeNode";

export class DataTreeNode extends TreeNode {
    protected data: Data;
    
    constructor(data: Data) {
        super();
        this.data = data;
    }
}