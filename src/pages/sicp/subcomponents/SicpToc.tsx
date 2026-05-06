import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Constants from 'src/commons/utils/Constants';

import fallbackToc from '../../../features/sicp/data/toc.json';
import { useSicpLanguageContext } from './SicpLanguageProvider';

type TocProps = OwnProps;

type OwnProps = {
  handleCloseToc?: () => void;
};

/**
 * Table of contents of SICP.
 */
const SicpToc: React.FC<TocProps> = props => {
  const [sidebarContent, setSidebarContent] = useState(fallbackToc as TreeNodeInfo[]);
  const navigate = useNavigate();
  const { sicpLanguage } = useSicpLanguageContext();

  useEffect(() => {
    const loadLocalizedToc = async () => {
      const resp = await fetch(`${Constants.sicpBackendUrl}json/${sicpLanguage}/toc.json`);
      return (await resp.json()) as TreeNodeInfo[];
    };
    loadLocalizedToc().then(setSidebarContent).catch(console.error);
  }, [sicpLanguage]);

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
      navigate('/sicpjs/' + String(node.nodeData));
    },
    [navigate, props]
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
