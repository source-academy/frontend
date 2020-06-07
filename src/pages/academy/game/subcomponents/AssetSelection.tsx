import * as React from 'react';
import { ITreeNode, Tree } from '@blueprintjs/core';
import * as _ from 'lodash';

type TreeState = {
  nodes: ITreeNode[];
};

type OwnProps = {
  assetPaths: string[];
};

function AssetSelection({ assetPaths }: OwnProps) {
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    setAssetTree({ nodes: listToTree(assetPaths) });
  }, [assetPaths]);

  const handleNodeClick = React.useCallback(
    (nodeData: ITreeNode) => {
      treeMap(assetTree.nodes, (node: ITreeNode) => (node.isSelected = false));
      nodeData.isSelected = !nodeData.isSelected;
      nodeData.isExpanded = !nodeData.isExpanded;
      setAssetTree({ ...assetTree });
    },
    [assetTree]
  );

  return <Tree contents={assetTree.nodes} onNodeClick={handleNodeClick} />;
}

export default AssetSelection;

function treeMap(nodes: ITreeNode[] | undefined, fn: (node: ITreeNode) => void) {
  if (!nodes) {
    return;
  }
  for (const node of nodes) {
    fn(node);
    treeMap(node.childNodes, fn);
  }
}

function pathToObj(assetPaths: string[]): object {
  const assetObj = {};
  assetPaths.forEach(assetPath => {
    const assetPathList = assetPath.split('/');
    const file = assetPathList.pop();
    const oldfilesInFolder = _.get(assetObj, assetPathList);
    if (Array.isArray(oldfilesInFolder) || !oldfilesInFolder) {
      const newFilesInFolder = oldfilesInFolder ? [...oldfilesInFolder, file] : [file];
      _.set(assetObj, assetPathList, newFilesInFolder);
    }
  });
  return assetObj;
}

function listToTree(assetPaths: string[]): ITreeNode[] {
  var assetCounter = 0;
  const assetObj = pathToObj(assetPaths);
  function helper(assetObj: object | Array<string>): ITreeNode[] {
    if (Array.isArray(assetObj)) {
      return assetObj.map(asset => ({ id: assetCounter++, label: asset }));
    }
    return Object.keys(assetObj).map(key => {
      return { id: assetCounter++, label: key, childNodes: helper(assetObj[key]) };
    });
  }
  return helper(assetObj);
}
