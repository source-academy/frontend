import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { readSicpLangLocalStorage } from 'src/features/sicp/utils/SicpUtils';

import fallbackToc from '../../../features/sicp/data/toc.json';

const baseUrl = Constants.sicpBackendUrl + 'json/';
const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

type TocProps = OwnProps;

type OwnProps = {
  handleCloseToc?: () => void;
};

/**
 * Table of contents of SICP.
 */

const Toc: React.FC<{ toc: TreeNodeInfo[], props: TocProps }> = ({toc, props}) => {
  const [sidebarContent, setSidebarContent] = useState(toc);
  const navigate = useNavigate();

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
    <Tree
      className="sicp-toc-tree"
      contents={sidebarContent}
      onNodeClick={handleNodeClicked}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
    />
  );
};

const SicpToc: React.FC<TocProps> = props => {
  const [lang, setLang] = useState(readSicpLangLocalStorage());
  const [toc, setToc] = useState([] as TreeNodeInfo[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const handleLangChange = () => {
      setLang(readSicpLangLocalStorage());
    }
    window.addEventListener('sicp-tb-lang-change', handleLangChange);
    return () => window.removeEventListener('sicp-tb-lang-change', handleLangChange)
  }, []);

  React.useEffect(() => {
    setLoading(true);
    fetch(baseUrl + lang + '/toc.json')
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(json => {
        setToc(json as TreeNodeInfo[]);
      })
      .catch(error => {
        console.log(error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lang]);

  return (
    <div className="sicp-toc">
      {loading ? (
        <div className="sicp-content">{loadingComponent}</div>
      ) : error ? (
        <Toc toc={fallbackToc as TreeNodeInfo[]} props={props} />
      ) : (
        <Toc toc={toc} props={props} />
      )}
    </div>
  );
};

export default SicpToc;
