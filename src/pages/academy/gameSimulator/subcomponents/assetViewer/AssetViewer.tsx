import { Tab, Tabs, Tree, TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React from 'react';
import { useRequest } from 'src/commons/utils/Hooks';
import { fetchAssetPaths, s3AssetFolders } from 'src/features/gameSimulator/GameSimulatorService';

import AssetViewerPreview from './AssetViewerPreview';
import AssetViewerUpload from './AssetViewerUpload';
import { convertAssetPathsToTree, deleteIcon, treeMap } from './AssetViewerUtils';

/**
 * This component renders the Asset Viewer component.
 *
 * It provides a preview of all the S3 asset files in a document tree format.
 * The selected asset will be available for preview.
 */
const AssetViewer = () => {
  const { value: assetPaths } = useRequest<string[]>(fetchAssetPaths, []);

  const [currentAsset, setCurrentAsset] = React.useState('');
  const [assetTree, setAssetTree] = React.useState([] as TreeNodeInfo[]);

  React.useEffect(() => {
    setAssetTree(convertAssetPathsToTree(assetPaths, deleteIcon, s3AssetFolders));
  }, [assetPaths]);

  const handleNodeClick = (nodeData: TreeNodeInfo, path: integer[]) => {
    const selectedPath = nodeData.id.toString();
    if (!nodeData.childNodes) {
      setCurrentAsset(selectedPath);
    }
    const newTree = cloneDeep(assetTree);
    const originallySelected = Tree.nodeFromPath(path, newTree).isSelected;
    treeMap(newTree, (node: TreeNodeInfo) => (node.isSelected = false));
    Tree.nodeFromPath(path, newTree).isSelected =
      originallySelected === null ? true : !originallySelected;
    Tree.nodeFromPath(path, newTree).isExpanded = !Tree.nodeFromPath(path, newTree).isExpanded;
    setAssetTree(newTree);
  };

  return (
    <>
      <h3>View / Upload Assets</h3>
      <Tabs animate={true} id="assetviewer" renderActiveTabPanelOnly={true}>
        <Tab
          id="view"
          title="View Assets"
          panel={
            <>
              <AssetViewerPreview assetPath={currentAsset} />
              <hr />
              <br />
              <Tree contents={assetTree} onNodeClick={handleNodeClick} />
            </>
          }
        />
        <Tab id="upload" title="Upload Assets" panel={<AssetViewerUpload />} />
      </Tabs>
    </>
  );
};

export default AssetViewer;