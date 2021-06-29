import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router';

import toc from '../../../features/sicp/data/toc.json';

type TocProps = OwnProps;

type OwnProps = {
  handleCloseToc?: () => void;
};

/**
 * Table of contents of SICP.
 */
const SicpToc: React.FC<TocProps> = props => {
  const [sidebarContent, setSidebarContent] = useState(toc as TreeNodeInfo[]);
  const history = useHistory();

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

  const handleNodeClicked = React.useCallback(
    (node: TreeNodeInfo) => {
      if (props.handleCloseToc) {
        props.handleCloseToc();
      }
      history.push('/sicpjs/' + String(node.nodeData));
    },
    [history, props]
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
};

export default SicpToc;
