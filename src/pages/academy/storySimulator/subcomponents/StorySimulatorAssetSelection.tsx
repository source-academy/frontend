import { ITreeNode, Tree } from '@blueprintjs/core';
import React from 'react';

import { assetPathsToTree, treeMap } from './StorySimulatorAssetSelectionHelper';
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
