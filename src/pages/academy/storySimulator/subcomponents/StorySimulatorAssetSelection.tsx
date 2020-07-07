import * as React from 'react';
import { ITreeNode, Tree, Tooltip, Icon } from '@blueprintjs/core';
import * as _ from 'lodash';
import { s3AssetFolders, deleteS3File } from 'src/features/storySimulator/StorySimulatorService';

type TreeState = {
  nodes: ITreeNode[];
};

type ExtendedTreeNode = ITreeNode & { shortPath: string };

type Props = {
  assetPaths: string[];
  setCurrentAsset: React.Dispatch<React.SetStateAction<string>>;
  accessToken?: string;
};

function StorySimulatorAssetSelection({ assetPaths, setCurrentAsset, accessToken }: Props) {
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });
  const [fetchToggle, setFetchToggle] = React.useState(false);

  React.useEffect(() => {
    if (!accessToken) {
      setFetchToggle(!fetchToggle);
      return;
    }
    setAssetTree({ nodes: listToTree(assetPaths, accessToken) });
  }, [accessToken, assetPaths, fetchToggle]);

  const handleNodeClick = React.useCallback(
    (nodeData: ITreeNode) => {
      treeMap(assetTree.nodes, (node: ITreeNode) => (node.isSelected = false));
      nodeData.isSelected = !nodeData.isSelected;
      nodeData.isExpanded = !nodeData.isExpanded;
      const selectedPath = (nodeData as ExtendedTreeNode).shortPath;
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

function listToTree(assetPaths: string[], accessToken: string): ITreeNode[] {
  let assetCounter = 0;
  const assetObj = {};
  assetPaths.forEach(assetPath => _.set(assetObj, assetPath.split('/'), 'FILE'));
  s3AssetFolders.forEach(folder => !assetObj[folder] && (assetObj[folder] = []));

  function helper(parentFolders: string[], assetObj: object | Array<string>): ITreeNode[] {
    return Object.keys(assetObj).map(file => {
      const shortPath = '/' + parentFolders.join('/') + '/' + file;
      return {
        id: assetCounter++,
        label: file,
        shortPath,
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
