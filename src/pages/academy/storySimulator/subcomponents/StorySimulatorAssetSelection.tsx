import { Icon, ITreeNode, Tooltip, Tree } from '@blueprintjs/core';
import * as _ from 'lodash';
import React from 'react';
import { deleteS3File, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

import StorySimulatorAssetViewer from './StorySimulatorAssetViewer';

type TreeState = {
  nodes: ITreeNode[];
};

type Props = {
  assetPaths: string[];
};

const StorySimulatorAssetSelection = ({ assetPaths }: Props) => {
  const [currentAsset, setCurrentAsset] = React.useState('');
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    setAssetTree({ nodes: assetPathsToTree(assetPaths) });
  }, [assetPaths]);

  const handleNodeClick = (nodeData: ITreeNode) => {
    treeMap(assetTree.nodes, (node: ITreeNode) => (node.isSelected = false));
    nodeData.isSelected = !nodeData.isSelected;
    nodeData.isExpanded = !nodeData.isExpanded;
    const selectedPath = nodeData.id.toString();
    if (!nodeData.childNodes) {
      setCurrentAsset(selectedPath);
      sessionStorage.setItem('selectedAsset', selectedPath);
    }
    setAssetTree({ ...assetTree });
  };

  return (
    <>
      <StorySimulatorAssetViewer assetPath={currentAsset} />
      <Tree contents={assetTree.nodes} onNodeClick={handleNodeClick} />
    </>
  );
};

export default StorySimulatorAssetSelection;

function treeMap(nodes: ITreeNode[] | undefined, fn: (node: ITreeNode) => void) {
  nodes &&
    nodes.forEach(node => {
      fn(node);
      treeMap(node.childNodes, fn);
    });
}

const deleteFile = (filePath: string) => async () => {
  const confirm = window.confirm(
    `Are you sure you want to delete ${filePath}?\nThere is no undoing this action!`
  );
  alert(confirm ? await deleteS3File(filePath) : 'Whew');
};

function assetPathsToTree(assetPaths: string[]): ITreeNode[] {
  const assetObj = {};
  assetPaths.forEach(assetPath => _.set(assetObj, assetPath.split('/'), 'FILE'));
  s3AssetFolders.forEach(folder => {
    if (!assetObj[folder] || assetObj[folder] === 'FILE') {
      assetObj[folder] = [];
    }
  });

  function helper(parentFolders: string[], assetObj: object | Array<string>): ITreeNode[] {
    return Object.keys(assetObj).map(file => {
      const shortPath = '/' + parentFolders.join('/') + '/' + file;
      return {
        id: shortPath,
        label: file,
        secondaryLabel: (
          <Tooltip content="Delete">
            <Icon icon="trash" onClick={deleteFile(shortPath)} />
          </Tooltip>
        ),
        childNodes:
          assetObj[file] === 'FILE' ? undefined : helper([...parentFolders, file], assetObj[file])
      };
    });
  }
  return helper([], assetObj);
}
