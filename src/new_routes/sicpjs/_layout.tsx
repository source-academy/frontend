import 'katex/dist/katex.min.css';

import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import { setLocalStorage } from 'src/commons/utils/LocalStorageHelper';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import {
  readSicpSectionLocalStorage,
  setSicpSectionLocalStorage,
  SICP_CACHE_KEY,
  SICP_INDEX,
} from 'src/features/sicp/utils/SicpUtils';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';

const baseUrl = Constants.sicpBackendUrl + 'json/';
const extension = '.json';

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

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

const scrollRefIntoView = (
  ref: HTMLElement | null,
  parentRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (!ref || !parentRef?.current) {
    return;
  }

  const parent = parentRef.current!;
  const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;

  parent.scrollTo({
    behavior: 'smooth',
    top: ref.offsetTop - relativeTop,
  });
};

function SicpLayout() {
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(false);
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

  // Handle loading of latest viewed section and fetch json data
  useEffect(() => {
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
  useEffect(() => {
    if (loading) {
      return;
    }

    const hash = location.hash;
    const elem =
      (hash ? (document.querySelector(hash) as HTMLElement | null) : null) ?? refs.current[hash];
    scrollRefIntoView(elem, parentRef);
  }, [loading, location.hash]);

  return (
    <div
      className={classNames('Sicp', Classes.RUNNING_TEXT, Classes.TEXT_LARGE, Classes.DARK)}
      ref={parentRef}
    >
      <SicpErrorBoundary>
        {/* Close all active code snippet when new page is loaded */}
        <CodeSnippetProvider key={section}>
          {loading ? (
            <div className="sicp-content">{loadingComponent}</div>
          ) : (
            <Outlet context={{ data }} />
          )}
        </CodeSnippetProvider>
      </SicpErrorBoundary>
      {/* Chatbot intentionally disabled for JavaScript layout. */}
    </div>
  );
}

export const Component = SicpLayout;
