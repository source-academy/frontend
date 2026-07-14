import 'katex/dist/katex.min.css';

import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { readLocalStorage, setLocalStorage } from 'src/commons/hooks/useLocalStorageState';
import Constants from 'src/commons/utils/Constants';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { scrollRefIntoView } from 'src/features/sicp/utils/SicpUtils';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';

const baseUrl = Constants.sicpBackendUrl + 'json_py/';
const extension = '.json';

const SICPPY_CACHE_KEY = 'sicppy-section';
const SICPPY_DEFAULT_SECTION = 'index';

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

function SicpPyLayout() {
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(false);
  const { section } = useParams<{ section: string }>();
  const parentRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!section) {
      const cached = readLocalStorage(SICPPY_CACHE_KEY, SICPPY_DEFAULT_SECTION);
      /**
       * Handles rerouting to the latest viewed section when clicking from
       * the main application navbar. Navigate replace logic is used to allow the
       * user to still use the browser back button to navigate the app.
       */
      navigate(`/sicpy/${cached}`, { replace: true });
      return;
    }

    if (section === 'index') {
      setLocalStorage(SICPPY_CACHE_KEY, 'index');
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    fetch(baseUrl + section + extension, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(myJson => {
        try {
          const newData = parseArr(myJson, refs);
          setData(newData);
          setLocalStorage(SICPPY_CACHE_KEY, section);
        } catch (error) {
          throw new ParseJsonError(error.message);
        }
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }
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
        setLocalStorage(SICPPY_CACHE_KEY, SICPPY_DEFAULT_SECTION);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [section, navigate]);

  // Scroll to correct position
  useEffect(() => {
    if (loading) {
      return;
    }

    const hash = location.hash;
    const elem = (hash ? document.getElementById(hash.slice(1)) : null) ?? refs.current[hash];
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
    </div>
  );
}

export const Component = SicpPyLayout;
