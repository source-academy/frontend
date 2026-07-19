import 'katex/dist/katex.min.css';

import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { readLocalStorage } from 'src/commons/hooks/useLocalStorageState';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { scrollRefIntoView } from 'src/features/sicp/utils/SicpUtils';
import {
  SICP_CACHE_KEY,
  SICP_INDEX,
  useSicpJsSectionQuery,
} from 'src/features/textbook/hooks/useTextbookSectionQuery';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

// Chatbot utilities removed from JS layout

function SicpLayout() {
  const { section } = useParams();
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle rerouting to the latest viewed section when clicking from the main
  // application navbar. Navigate replace logic is used to allow the user to
  // still use the browser back button to navigate the app.
  useEffect(() => {
    if (!section) {
      const cached = readLocalStorage<string>(SICP_CACHE_KEY, SICP_INDEX);
      navigate(`/sicpjs/${cached}`, { replace: true });
    }
  }, [section, navigate]);

  const { data, error, isPending, isFetching, refs } = useSicpJsSectionQuery(section);
  // Index page is served from local content, not the network, so it is never loading
  const isLoading = section !== SICP_INDEX && (isPending || isFetching);

  // Scroll to correct position
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const hash = location.hash;
    const elem =
      (hash ? (document.querySelector(hash) as HTMLElement | null) : null) ?? refs.current[hash];
    scrollRefIntoView(elem, parentRef);
  }, [isLoading, location.hash, refs]);

  return (
    <div
      className={classNames('Sicp', Classes.RUNNING_TEXT, Classes.TEXT_LARGE, Classes.DARK)}
      ref={parentRef}
    >
      <SicpErrorBoundary>
        {/* Close all active code snippet when new page is loaded */}
        <CodeSnippetProvider key={section}>
          {isLoading ? (
            <div className="sicp-content">{loadingComponent}</div>
          ) : error ? (
            error.message === 'Not Found' ? (
              getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR)
            ) : error instanceof ParseJsonError ? (
              getSicpError(SicpErrorType.PARSING_ERROR)
            ) : (
              getSicpError(SicpErrorType.UNEXPECTED_ERROR)
            )
          ) : (
            <Outlet context={{ data }} />
          )}
        </CodeSnippetProvider>
      </SicpErrorBoundary>
      {/* Chatbot moved to Python layout */}
    </div>
  );
}

export const Component = SicpLayout;
