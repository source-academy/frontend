import 'katex/dist/katex.min.css';

import { Button, Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from 'src/commons/utils/Hooks';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import SicpErrorBoundary from 'src/features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from 'src/features/sicp/errors/SicpErrors';
import { ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import { scrollRefIntoView } from 'src/features/sicp/utils/SicpUtils';
import {
  SICP_INDEX,
  useSicpJsSectionQuery,
} from 'src/features/textbook/hooks/useTextbookSectionQuery';
import { fetchSicpSearchData } from 'src/features/textbook/navigationBar/autocomplete/query';
import SicpTextbookNavigationBar from 'src/features/textbook/navigationBar/SicpTextbookNavigationBar';
import tocNavigation from 'src/features/textbook/toc/data/sicpjs-navigation.json';
import toc from 'src/features/textbook/toc/data/sicpjs-toc.json';
import SicpIndexPage from 'src/pages/sicp/subcomponents/sicpIndexPage/SicpIndexPage';

type Props = {
  section: string;
  onNavigate: (section: string) => void;
};

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;
const embeddedContentClassName = 'sicp-content px-10 text-base text-[#333333]';

function Sicp({ section, onNavigate }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [hash, setHash] = useState('');
  const titleImageUrl = useAppSelector(
    state => state.languageDirectory.languageMap.source1?.textbook?.titleImageUrl,
  );
  const { data, error, isPending, isFetching, refs } = useSicpJsSectionQuery(section);
  const isLoading = section !== SICP_INDEX && (isPending || isFetching);

  const handleNavigation = useCallback(
    (destination: string) => {
      const [nextSection, nextHash] = destination.split('#', 2);
      setHash(nextHash ? `#${nextHash}` : '');
      onNavigate(nextSection);
    },
    [onNavigate],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hash) {
      parentRef.current?.scrollTo({ top: 0 });
      return;
    }

    const element = parentRef.current?.querySelector<HTMLElement>(hash) ?? refs.current[hash];
    scrollRefIntoView(element, parentRef);
  }, [hash, isLoading, section, refs]);

  const prev = getPrev(tocNavigation, section);
  const next = getNext(tocNavigation, section);

  return (
    <div className={classNames('Sicp', Classes.RUNNING_TEXT, Classes.TEXT_LARGE)} ref={parentRef}>
      <SicpTextbookNavigationBar
        routePrefix="/sicpjs"
        section={section}
        onNavigate={handleNavigation}
        getPrev={currentSection => getPrev(tocNavigation, currentSection)}
        getNext={currentSection => getNext(tocNavigation, currentSection)}
        queryKey="sicpSearchData"
        fetchSearchData={fetchSicpSearchData}
        toc={toc}
        tocTreeClassName="bg-white text-base"
        sticky
      />
      <SicpErrorBoundary>
        <CodeSnippetProvider key={section}>
          {isLoading ? (
            <div className={embeddedContentClassName}>{loadingComponent}</div>
          ) : error ? (
            error.message === 'Not Found' ? (
              getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR)
            ) : error instanceof ParseJsonError ? (
              getSicpError(SicpErrorType.PARSING_ERROR)
            ) : (
              getSicpError(SicpErrorType.UNEXPECTED_ERROR)
            )
          ) : section === SICP_INDEX ? (
            <SicpIndexPage titleImageUrl={titleImageUrl} onNavigate={handleNavigation} />
          ) : (
            <div className={embeddedContentClassName}>
              <div id="begin" />
              {data}
              <div className="sicp-navigation-buttons">
                {prev && <Button onClick={() => handleNavigation(prev)}>Previous</Button>}
                {next && <Button onClick={() => handleNavigation(next)}>Next</Button>}
              </div>
              <div id="end" />
            </div>
          )}
        </CodeSnippetProvider>
      </SicpErrorBoundary>
    </div>
  );
}

export default Sicp;
