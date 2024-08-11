import 'katex/dist/katex.min.css';

import { Button, Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import { setLocalStorage } from 'src/commons/utils/LocalStorageHelper';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import {
  readSicpSectionLocalStorage,
  setSicpSectionLocalStorage,
  SICP_CACHE_KEY,
  SICP_INDEX
} from 'src/features/sicp/utils/SicpUtils';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';
import Chatbot from './subcomponents/chatbot/Chatbot';
import SicpIndexPage from './subcomponents/SicpIndexPage';

const baseUrl = Constants.sicpBackendUrl + 'json/';
const extension = '.json';

// Context to determine which code snippet is active
export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

const Sicp: React.FC = () => {
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('0');
  const { section } = useParams<{ section: string }>();
  const parentRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSession();

  function getSection() {
    // To discard the '/sicpjs/'
    return location.pathname.replace('/sicpjs/', '') as SicpSection;
  }

  const getText = () => {
    const divs = document.querySelectorAll('p.sicp-text');
    let visibleParagraphs = '';

    divs.forEach(div => {
      const rect = div.getBoundingClientRect();

      if (
        rect.top <= window.innerHeight &&
        rect.bottom >= 0 &&
        rect.left <= window.innerWidth &&
        rect.right >= 0
      ) {
        const text = div.textContent;
        visibleParagraphs += text + '\n';
      }
    });

    return visibleParagraphs;
  };

  const scrollRefIntoView = (ref: HTMLElement | null) => {
    if (!ref || !parentRef?.current) {
      return;
    }

    const parent = parentRef.current!;
    const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;

    parent.scrollTo({
      behavior: 'smooth',
      top: ref.offsetTop - relativeTop
    });
  };

  // Handle loading of latest viewed section and fetch json data
  React.useEffect(() => {
    if (!section) {
      /**
       * Handles rerouting to the latest viewed section when clicking from
       * the main application navbar. Navigate replace logic is used to allow the
       * user to still use the browser back button to navigate the app.
       */
      navigate(`/sicpjs/${readSicpSectionLocalStorage()}`, { replace: true });
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
  }, [section, navigate]);

  // Scroll to correct position
  React.useEffect(() => {
    if (loading) {
      return;
    }

    const hash = location.hash;
    const ref = refs.current[hash];

    scrollRefIntoView(ref);
  }, [location.hash, loading]);

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
    navigate('/sicpjs/' + sect);
  };

  // `section` is defined due to the navigate logic in the useEffect above
  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {getPrev(section!) && (
        <Button onClick={() => handleNavigation(getPrev(section!)!)}>Previous</Button>
      )}
      {getNext(section!) && (
        <Button onClick={() => handleNavigation(getNext(section!)!)}>Next</Button>
      )}
    </div>
  );

  return (
    <div
      className={classNames('Sicp', Classes.RUNNING_TEXT, Classes.TEXT_LARGE, Classes.DARK)}
      ref={parentRef}
    >
      <SicpErrorBoundary>
        <CodeSnippetContext.Provider value={{ active: active, setActive: handleSnippetEditorOpen }}>
          {loading ? (
            <div className="sicp-content">{loadingComponent}</div>
          ) : section === 'index' ? (
            <SicpIndexPage />
          ) : (
            <div className="sicp-content">
              <Link to="#begin" ref={ref => (refs.current['#begin'] = ref)} />
              {data}
              {navigationButtons}
              <Link to="#end" ref={ref => (refs.current['#end'] = ref)} />
            </div>
          )}
        </CodeSnippetContext.Provider>
      </SicpErrorBoundary>
      {isLoggedIn && Constants.featureFlags.enableSicpChatbot && (
        <Chatbot getSection={getSection} getText={getText} />
      )}
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Sicp;
Component.displayName = 'Sicp';

export default Sicp;
