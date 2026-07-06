import { Tree, type TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash-es';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import toc from '../../../features/sicp/data/toc-py.json';

type Props = {
  handleCloseToc?: () => void;
};

function SicpPyToc({ handleCloseToc }: Props) {
  const [sidebarContent, setSidebarContent] = useState(toc as TreeNodeInfo[]);
  const navigate = useNavigate();

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

  const handleNodeClicked = useCallback(
    (node: TreeNodeInfo) => {
      handleCloseToc?.();
      navigate('/sicpy/' + String(node.nodeData));
    },
    [navigate, handleCloseToc],
  );

  return (
    <div className="sicp-toc">
      <Tree
        className="sicp-toc-tree"
        contents={sidebarContent}
        onNodeClick={handleNodeClicked}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
}

export default SicpPyToc;
