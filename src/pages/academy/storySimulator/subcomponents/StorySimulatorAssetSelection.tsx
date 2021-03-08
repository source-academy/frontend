import { Icon, ITreeNode, Tree } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { useRequest } from 'src/commons/utils/Hooks';
import {
  deleteS3File,
  fetchAssetPaths,
  s3AssetFolders
} from 'src/features/storySimulator/StorySimulatorService';

import { assetPathsToTree, treeMap } from './StorySimulatorAssetSelectionHelper';
import StorySimulatorAssetViewer from './StorySimulatorAssetViewer';

type TreeState = {
  nodes: ITreeNode[];
};

/**
 * This component provides a preview of all the S3 asset files.
 *
 * When a image is selected, the filename of the image is stored in session storage,
 * so Story Simulator's Object Placement can read the filename and load the image.
 */
const StorySimulatorAssetSelection = () => {
  const { value: assetPaths } = useRequest<string[]>(fetchAssetPaths, []);

  const [currentAsset, setCurrentAsset] = React.useState('');
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    setAssetTree({ nodes: assetPathsToTree(assetPaths, toolIcons, s3AssetFolders) });
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

/**
 * Tools that are added to asset selection, includes: trash-can delete tool
 *
 * @param filePath the path to asset you want to supply tools for
 * @returns {JSX.Element} A trash can that deletes the file given the asset path
 */
const toolIcons = (filePath: string) => (
  <Tooltip2 content="Delete">
    <Icon icon="trash" onClick={deleteFile(filePath)} />
  </Tooltip2>
);

/**
 * This function deletes an S3 file given the short filepath
 *
 * @param filePath - the file path e.g. "stories/chapter0.txt"
 */
const deleteFile = (filePath: string) => async () => {
  const confirm = window.confirm(
    `Are you sure you want to delete ${filePath}?\nThere is no undoing this action!`
  );
  alert(confirm ? await deleteS3File(filePath) : 'Whew');
};

export default StorySimulatorAssetSelection;
