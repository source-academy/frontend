import 'katex/dist/katex.min.css';

import { Button, Classes, NonIdealState, Spinner, TreeNodeInfo } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import Constants from 'src/commons/utils/Constants';
import { setLocalStorage } from 'src/commons/utils/LocalStorageHelper';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import {
  setSicpSectionLocalStorage,
  SICP_CACHE_KEY,
  SICP_INDEX
} from 'src/features/sicp/utils/SicpUtils';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';
import SicpIndexPage from './SicpIndexPage';
import SicpNavigationBar from './SicpNavigationBar';

const baseUrl = Constants.sicpBackendUrl + 'json/';
const extension = '.json';

// Context to determine which code snippet is active
export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

type SicpProps = {
  setSicpHomeCallBackFn: (fn: () => void) => void;
};

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('0');
  const [section, setSection] = useState('index');
  const [hash, setHash] = useState('#begin');
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const navigate = useNavigate();

  const scrollRefIntoView = (ref: HTMLElement | null) => {
    // console.log(`Scrolling ${ref} into view...`);
    if (!ref) {
      return;
    }

    ref.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Handle loading of latest viewed section and fetch json data
  React.useEffect(() => {
    props.setSicpHomeCallBackFn(() => {
      setSection('index');
    });
    if (!section) {
      /**
       * Handles rerouting to the latest viewed section when clicking from
       * the main application navbar. Navigate replace logic is used to allow the
       * user to still use the browser back button to navigate the app.
       */
      // navigate(`/sicpjs/${readSicpSectionLocalStorage()}`, { replace: true });
      return;
    }

    if (section === SICP_INDEX) {
      setSicpSectionLocalStorage(SICP_INDEX);
      return;
    }

    setLoading(true);

    fetch(baseUrl + section + extension)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(myJson => {
        try {
          const newData = parseArr(myJson, refs); // Might throw error
          setData(newData);
          setSicpSectionLocalStorage(section); // Sets local storage if valid page
        } catch (error) {
          throw new ParseJsonError(error.message);
        }
      })
      .catch(error => {
        console.error(error);

        if (error.message === 'Not Found') {
          // page not found
          setData(getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR));
        } else if (error instanceof ParseJsonError) {
          // error occurred while parsing JSON
          setData(getSicpError(SicpErrorType.PARSING_ERROR));
        } else {
          setData(getSicpError(SicpErrorType.UNEXPECTED_ERROR));
        }
        setLocalStorage(SICP_CACHE_KEY, SICP_INDEX); // Prevents caching invalid page
      })
      .finally(() => {
        setLoading(false);
      });
  }, [section, navigate, props]);

  // Scroll to correct position
  React.useEffect(() => {
    if (loading) {
      return;
    }

    const ref = refs.current[`#${hash}`];
    scrollRefIntoView(ref);
  }, [loading, hash]);

  // Close all active code snippet when new page is loaded
  React.useEffect(() => {
    setActive('0');
  }, [data]);

  const dispatch = useDispatch();
  const handleSnippetEditorOpen = (s: string) => {
    setActive(s);
    dispatch(WorkspaceActions.resetWorkspace('sicp'));
    dispatch(WorkspaceActions.toggleUsingSubst(false, 'sicp'));
  };
  const handleNavigation = (sect: string) => {
    // console.log(`Navigating to section: ${sect}`);
    setSection(sect);
  };

  // `section` is defined due to the navigate logic in the useEffect above
  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {getPrev(section!) && (
        <Button style={{ textWrap: 'nowrap' }} onClick={() => handleNavigation(getPrev(section!)!)}>
          Previous
        </Button>
      )}
      {getNext(section!) && (
        <Button style={{ textWrap: 'nowrap' }} onClick={() => handleNavigation(getNext(section!)!)}>
          Next
        </Button>
      )}
    </div>
  );

  const handleNodeClicked = React.useCallback(
    (node: TreeNodeInfo) => {
      // console.log(`Navigating to section: ${String(node.nodeData)}`);
      setSection(String(node.nodeData));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section]
  );

  const handleNodeClickedString = React.useCallback(
    (sect: string) => {
      const urlPart = sect.split('#');
      if (urlPart.length > 1) {
        console.log(`URL Part: ${urlPart[1]}`);
        setHash(urlPart[1]);
      }
      // console.log(`Navigating to section: ${urlPart[0]}`);
      setSection(urlPart[0]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section]
  );

  return (
    <div style={{ maxHeight: '60vh' }} className={classNames('Sicp', Classes.TEXT_LARGE)}>
      <SicpNavigationBar
        handleNodeClickedString={handleNodeClickedString}
        handleNodeClicked={handleNodeClicked}
      />
      <SicpErrorBoundary>
        <CodeSnippetContext.Provider value={{ active: active, setActive: handleSnippetEditorOpen }}>
          {loading ? (
            <div className="sicp-content">{loadingComponent}</div>
          ) : section === 'index' ? (
            <SicpIndexPage handleNodeClick={handleNodeClicked} />
          ) : (
            <div className="sicp-content sicp-assessment">
              <Link to="#begin" ref={ref => (refs.current['#begin'] = ref)} />
              {data}
              {navigationButtons}
              <Link to="#end" ref={ref => (refs.current['#end'] = ref)} />
            </div>
          )}
        </CodeSnippetContext.Provider>
      </SicpErrorBoundary>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Sicp;
Component.displayName = 'Sicp';

export default Sicp;
