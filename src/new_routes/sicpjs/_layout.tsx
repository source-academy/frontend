import 'katex/dist/katex.min.css';

import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { readLocalStorage } from 'src/commons/hooks/useLocalStorageState';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { scrollRefIntoView } from 'src/features/sicp/utils/SicpUtils';
import {
  SICP_CACHE_KEY,
  SICP_INDEX,
  useSicpJsSectionQuery,
} from 'src/pages/sicp/hooks/useSicpQuery';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';
import Chatbot from '../../pages/sicp/subcomponents/chatbot/Chatbot';

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

function SicpLayout() {
  const { section } = useParams<{ section: string }>();
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSession();

  function getSection() {
    // To discard the '/sicpjs/'
    return location.pathname.replace('/sicpjs/', '') as SicpSection;
  }

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
  const isLoading = isPending || isFetching;

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
      {isLoggedIn && Constants.featureFlags.enableSicpChatbot && (
        <Chatbot getSection={getSection} getText={getText} />
      )}
    </div>
  );
}

export const Component = SicpLayout;
