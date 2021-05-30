import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { Redirect } from 'react-router';

import toc from '../../../features/sicp/data/toc.json';

type TocProps = OwnProps;

type OwnProps = {
  handleCloseToc?: () => void;
  location: 'sidebar' | 'index';
};

const SicpToc: React.FC<TocProps> = props => {
  const [sidebarContent, setSidebarContent] = useState(toc as TreeNodeInfo[]);
  const [slug, setSlug] = useState('');

  const handleNodeExpand = (node: TreeNodeInfo, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = true;
    setSidebarContent(newState);
  };

  const handleNodeCollapse = (node: TreeNodeInfo, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = false;
    setSidebarContent(newState);
  };

  const handleNodeClicked = React.useCallback(
    (node: TreeNodeInfo) => {
      if (props.handleCloseToc) {
        props.handleCloseToc();
      }
      setSlug(String(node.nodeData));
    },
    [props]
  );

  return (
    <div className="sicp-toc">
      {slug !== '' ? <Redirect to={'/interactive-sicp/' + slug} /> : <></>}
      <Tree
        contents={sidebarContent}
        onNodeClick={handleNodeClicked}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
};

export default SicpToc;
