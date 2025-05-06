import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import toc from 'src/features/sicp/data/toc.json';

type Props = {
  handleCloseToc?: () => void;
  handleNodeClicked?: (node: TreeNodeInfo) => void;
};

/**
 * Table of contents of SICP.
 */
const SicpToc: React.FC<Props> = props => {
  const [sidebarContent, setSidebarContent] = useState(toc as TreeNodeInfo[]);

  const handleNodeExpand = (_node: TreeNodeInfo, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = true;
    setSidebarContent(newState);
  };

  const handleNodeCollapse = (_node: TreeNodeInfo, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = false;
    setSidebarContent(newState);
  };

  return (
    <div className="sicp-toc sicp-toc-assessment">
      <Tree
        className="sicp-toc-tree"
        contents={sidebarContent}
        onNodeClick={props.handleNodeClicked}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
};

export default SicpToc;
