import { Tree, type TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState } from 'react';

type Props = {
  handleClick?: (node: TreeNodeInfo) => void;
  toc: TreeNodeInfo[];
};

/**
 * Table of contents of SICP.
 */
function SicpToc({ handleClick, toc }: Props) {
  const [sidebarContent, setSidebarContent] = useState(toc);

  // toc now arrives from a network fetch (see queryKeys/sicp.ts), so it starts
  // out empty and is replaced once the request resolves.
  useEffect(() => {
    setSidebarContent(toc);
  }, [toc]);

  const handleNodeExpand = (_node: TreeNodeInfo, path: number[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = true;
    setSidebarContent(newState);
  };

  const handleNodeCollapse = (_node: TreeNodeInfo, path: number[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = false;
    setSidebarContent(newState);
  };

  return (
    <div className="sicp-toc">
      <Tree
        className="sicp-toc-tree"
        contents={sidebarContent}
        onNodeClick={handleClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
}

export default SicpToc;
