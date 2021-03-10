import ExplorerFile from './ExplorerFile.js';

class ExplorerFileNode {
  file = null;
  parentFileNode = null;
  directoryExpanded = false;
  children = [];

  constructor(fileJsonObject, parentFileNode) {
    this.file = new ExplorerFile(fileJsonObject);
    this.parentFileNode = parentFileNode;
  }
}

export default ExplorerFileNode;
