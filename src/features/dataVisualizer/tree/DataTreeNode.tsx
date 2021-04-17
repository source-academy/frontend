import { Data } from '../dataVisualizerTypes';
import { TreeNode } from './BaseTreeNode';

/**
 * Represents node corresponding to a data object (neither pair nor function).
 */
export class DataTreeNode extends TreeNode {
  public readonly data: Data;

  constructor(data: Data) {
    super();
    this.data = data;
  }
}
