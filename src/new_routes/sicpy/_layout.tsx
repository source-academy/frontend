import 'katex/dist/katex.min.css';

import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import { readLocalStorage, setLocalStorage } from 'src/commons/utils/LocalStorageHelper';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';
import Chatbot from '../../pages/sicp/subcomponents/chatbot/Chatbot';

const baseUrl = Constants.sicpBackendUrl + 'json_py/';
const extension = '.json';

const SICPPY_CACHE_KEY = 'sicppy-section';
const SICPPY_DEFAULT_SECTION = 'index';

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

const scrollRefIntoView = (
  ref: HTMLElement | null,
  parentRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (!ref || !parentRef?.current) {
    return;
  }
  const parent = parentRef.current!;
  const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;
  parent.scrollTo({ behavior: 'smooth', top: ref.offsetTop - relativeTop });
};

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

function SicpPyLayout() {
  const [data, setData] = useState(<></>);
  const [loading, setLoading] = useState(false);
  const { section } = useParams<{ section: string }>();
  const parentRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSession();

  function getSection() {
    // To discard the '/sicpy/'
    return location.pathname.replace('/sicpy/', '') as SicpSection;
  }

  useEffect(() => {
    if (!section) {
      const cached = readLocalStorage(SICPPY_CACHE_KEY, SICPPY_DEFAULT_SECTION);
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
          setData(getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR));
        } else if (error instanceof ParseJsonError) {
          setData(getSicpError(SicpErrorType.PARSING_ERROR));
        } else {
          setData(getSicpError(SicpErrorType.UNEXPECTED_ERROR));
        }
        setLocalStorage(SICPPY_CACHE_KEY, SICPPY_DEFAULT_SECTION);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [section, navigate]);

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
        <CodeSnippetProvider key={section}>
          {loading ? (
            <div className="sicp-content">{loadingComponent}</div>
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

export const Component = SicpPyLayout;
