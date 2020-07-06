import * as React from 'react';
import { ITreeNode, Tree } from '@blueprintjs/core';
import * as _ from 'lodash';
import { s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

type TreeState = {
  nodes: ITreeNode[];
};

type OwnProps = {
  assetPaths: string[];
  setCurrentAsset: React.Dispatch<React.SetStateAction<string>>;
};

function StorySimulatorAssetSelection({ assetPaths, setCurrentAsset }: OwnProps) {
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    setAssetTree({ nodes: listToTree(assetPaths) });
  }, [assetPaths]);

  const handleNodeClick = React.useCallback(
    (nodeData: ITreeNode, levels: number[]) => {
      treeMap(assetTree.nodes, (node: ITreeNode) => (node.isSelected = false));
      nodeData.isSelected = !nodeData.isSelected;
      nodeData.isExpanded = !nodeData.isExpanded;
      const selectedPath = getFilePath(assetTree.nodes, levels);

      if (!nodeData.childNodes) {
        setCurrentAsset(selectedPath);
        sessionStorage.setItem('selectedAsset', selectedPath);
      }
      setAssetTree({ ...assetTree });
    },
    [assetTree, setCurrentAsset]
  );

  return <Tree contents={assetTree.nodes} onNodeClick={handleNodeClick} />;
}

export default StorySimulatorAssetSelection;

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
    if (file === 'Thumbs.db') {
      return;
    }
    const oldfilesInFolder = _.get(assetObj, assetPathList);
    if (Array.isArray(oldfilesInFolder) || !oldfilesInFolder) {
      const newFilesInFolder = oldfilesInFolder ? [...oldfilesInFolder, file] : [file];
      _.set(assetObj, assetPathList, newFilesInFolder);
    }
  });
  s3AssetFolders.forEach(folder => !assetObj[folder] && (assetObj[folder] = []));
  return assetObj;
}

function listToTree(assetPaths: string[]): ITreeNode[] {
  let assetCounter = 0;
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

function getFilePath(assetTree: ITreeNode[], levels: number[]) {
  let filePath = '';
  for (const [levelNumber, level] of levels.entries()) {
    const node = assetTree[level];
    filePath += '/' + node.label.toString();
    if (!node.childNodes || levelNumber === levels.length - 1) {
      return filePath;
    }
    assetTree = node.childNodes;
  }
  return '';
}
