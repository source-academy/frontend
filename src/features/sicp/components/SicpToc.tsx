import { ITreeNode, Tree } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { Redirect } from 'react-router';

import toc from '../data/toc.json';

type TocProps = OwnProps;

type OwnProps = {
  handleCloseToc: () => void;
  location: 'sidebar' | 'index';
};

const SicpToc: React.FC<TocProps> = props => {
  const [sidebarContent, setSidebarContent] = useState(toc as ITreeNode[]);
  const [hash, setHash] = useState('');

  const handleNodeExpand = (node: ITreeNode, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = true;
    setSidebarContent(newState);
  };

  const handleNodeCollapse = (node: ITreeNode, path: integer[]) => {
    const newState = cloneDeep(sidebarContent);
    Tree.nodeFromPath(path, newState).isExpanded = false;
    setSidebarContent(newState);
  };

  const handleNodeClicked = React.useCallback((node: ITreeNode) => {
    props.handleCloseToc();
    setHash(String(node.nodeData));
  }, [props]);

  return (
    <div className="sicp-toc">
      {hash !== '' ? <Redirect to={'/sicp#section=' + hash} /> : <></>}
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
