import { Data } from "../ListVisualizerTypes";
import { TreeNode } from "./BaseTreeNode";

export class DataTreeNode extends TreeNode {
    public readonly data: Data;
    
    constructor(data: Data) {
        super();
        this.data = data;
    }
}