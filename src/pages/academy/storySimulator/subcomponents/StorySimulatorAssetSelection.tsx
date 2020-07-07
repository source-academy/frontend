import * as React from 'react';
import { ITreeNode, Tree, Tooltip, Icon } from '@blueprintjs/core';
import * as _ from 'lodash';
import { s3AssetFolders, deleteS3File } from 'src/features/storySimulator/StorySimulatorService';

type TreeState = {
  nodes: ITreeNode[];
};

type Props = {
  assetPaths: string[];
  setCurrentAsset: React.Dispatch<React.SetStateAction<string>>;
  accessToken?: string;
};

function StorySimulatorAssetSelection({ assetPaths, setCurrentAsset, accessToken }: Props) {
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    if (!accessToken) {
      return;
    }
    setAssetTree({ nodes: assetPathsToTree(assetPaths, accessToken) });
  }, [accessToken, assetPaths]);

  const handleNodeClick = React.useCallback(
    (nodeData: ITreeNode) => {
      treeMap(assetTree.nodes, (node: ITreeNode) => (node.isSelected = false));
      nodeData.isSelected = !nodeData.isSelected;
      nodeData.isExpanded = !nodeData.isExpanded;
      const selectedPath = nodeData.id.toString();
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
  nodes &&
    nodes.forEach(node => {
      fn(node);
      treeMap(node.childNodes, fn);
    });
}

const deleteFile = (filePath: string, accessToken: string) => async () => {
  const confirm = window.confirm(
    `Are you sure you want to delete ${filePath}?\nThere is no undoing this action!`
  );
  alert(confirm ? await deleteS3File(accessToken, filePath) : 'Whew');
};

function assetPathsToTree(assetPaths: string[], accessToken: string): ITreeNode[] {
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
            <Icon icon="trash" onClick={deleteFile(shortPath, accessToken)} />
          </Tooltip>
        ),
        childNodes:
          assetObj[file] === 'FILE' ? undefined : helper([...parentFolders, file], assetObj[file])
      };
    });
  }
  return helper([], assetObj);
}
