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
    (nodeData: ITreeNode, levels: number[]) => {
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

const deleteFile = (filePath: string, accessToken: string) => async () =>
  await deleteS3File(accessToken, filePath);

function listToTree(assetPaths: string[], accessToken: string): ITreeNode[] {
  let assetCounter = 0;
  const assetObj = pathToObj(assetPaths);
  function helper(parentFolders: string[], assetObj: object | Array<string>): ITreeNode[] {
    if (Array.isArray(assetObj)) {
      return assetObj.map(asset => {
        const shortPath = '/' + parentFolders.join('/') + '/' + asset;
        return {
          id: assetCounter++,
          label: asset,
          shortPath,
          secondaryLabel: (
            <Tooltip content="Delete">
              <Icon icon="trash" onClick={deleteFile(shortPath, accessToken)} />
            </Tooltip>
          )
        };
      });
    }
    return Object.keys(assetObj).map(key => {
      return {
        id: assetCounter++,
        label: key,
        childNodes: helper([...parentFolders, key], assetObj[key])
      };
    });
  }
  return helper([], assetObj);
}
