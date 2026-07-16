import { Tree, type TreeNodeInfo } from '@blueprintjs/core';
import classNames from 'classnames';
import { cloneDeep } from 'lodash-es';
import { useState } from 'react';

type Props = {
  handleClick?: (node: TreeNodeInfo) => void;
  toc: TreeNodeInfo[];
  treeClassName?: string;
};

/**
 * Table of contents of SICP.
 */
function SicpToc({ handleClick, toc, treeClassName }: Props) {
  const [sidebarContent, setSidebarContent] = useState(toc);

  // Note: Technically this should have a useEffect to sync the state whenever
  // toc props changes, but since our usage uses a static toc, we can skip that for now.
  // https://github.com/source-academy/frontend/pull/4096#discussion_r3576815218

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
        className={classNames('sicp-toc-tree', treeClassName)}
        contents={sidebarContent}
        onNodeClick={handleClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
}

export default SicpToc;
