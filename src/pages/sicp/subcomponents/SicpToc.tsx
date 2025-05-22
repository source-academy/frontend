import { Tree, TreeNodeInfo } from '@blueprintjs/core';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import getSicpError, { SicpErrorType } from 'src/features/sicp/errors/SicpErrors';
import { readSicpLangLocalStorage } from 'src/features/sicp/utils/SicpUtils';

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
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch(baseUrl + readSicpLangLocalStorage() + '/toc.json')
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(toc => {
        const newData = (
          <Toc toc={toc as TreeNodeInfo[]} props={props} />
        );
        setData(newData);
      })
      .catch(error => {
        console.log(error);
        setData(getSicpError(SicpErrorType.UNEXPECTED_ERROR));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props]);

  return (
    <div className="sicp-toc">
      {loading ? (
        <div className="sicp-content">{loadingComponent}</div>
      ): data}
    </div>
  );
};

export default SicpToc;
