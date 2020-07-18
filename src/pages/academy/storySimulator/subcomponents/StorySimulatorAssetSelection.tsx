import { Icon, ITreeNode, Tooltip, Tree } from '@blueprintjs/core';
import React from 'react';
import { deleteS3File, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

import { assetPathsToTree, treeMap } from './StorySimulatorAssetSelectionHelper';
import StorySimulatorAssetViewer from './StorySimulatorAssetViewer';

type TreeState = {
  nodes: ITreeNode[];
};

type Props = {
  assetPaths: string[];
};

/**
 * This component takes in all the asset paths and renders them in a folder format
 * where each folder can be opened and closed
 *
 * When items are selected, filename is stored in session storage, so that
 * Story Simulator's Object Placement can read the filename
 *
 * @param assetPaths
 */
const StorySimulatorAssetSelection = ({ assetPaths }: Props) => {
  const [currentAsset, setCurrentAsset] = React.useState('');
  const [assetTree, setAssetTree] = React.useState<TreeState>({ nodes: [] });

  React.useEffect(() => {
    setAssetTree({ nodes: assetPathsToTree(assetPaths, fileTools, s3AssetFolders) });
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
 * Tools that are added to asset selection, includes: delete function
 *
 * @param filePath the file path you want to supply tools for
 */
const fileTools = (filePath: string) => (
  <Tooltip content="Delete">
    <Icon icon="trash" onClick={deleteFile(filePath)} />
  </Tooltip>
);

/**
 * This function brings up a confirmation to delete an S3 file given the short filepath
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
