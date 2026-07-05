import { Button, Classes, Icon, Menu, MenuItem, Tag, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Omnibar } from '@blueprintjs/select';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Latex from 'react-latex-next';
import ControlButton from 'src/commons/ControlButton';

import { emptySearchData } from './query';
import type { IndexSearchResult, SearchData } from './types';
import { indexAutoComplete, search, sentenceAutoComplete, sentenceSearch } from './utils';

function processIndexSearchResults(searchResults: IndexSearchResult[]): IndexSearchResult[] {
  return searchResults
    .filter(r => r.id)
    .sort((a, b) => {
      if (a.hasSubindex && !b.hasSubindex) {
        return 1;
      }
      if (!a.hasSubindex && b.hasSubindex) {
        return -1;
      }
      return a.order.localeCompare(b.order);
    });
}

type Mode = 'text' | 'index' | 'submenu';
type PreviousMode = 'text' | 'index' | null;
type SearchResultItem = string | IndexSearchResult;

type Props = {
  /** React Query cache key, e.g. "sicpSearchData" or "sicpPySearchData". */
  queryKey: string;
  /** Async fetcher for the SICP search-data JSON. */
  fetchSearchData: () => Promise<SearchData>;
  /** Invoked when the user picks a final destination. */
  onNavigate: (section: string) => void;
};

function SearchAutocomplete({ queryKey, fetchSearchData, onNavigate }: Props) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const { data, isFetching, error } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchSearchData,
    enabled: shouldLoad,
  });
  const rewritedSearchData = data ?? emptySearchData;

  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [omnibarMode, setOmnibarMode] = useState<Mode>('text');
  const [previousMode, setPreviousMode] = useState<PreviousMode>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  const initTextSearch = () => {
    setOmnibarMode('text');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
    setShouldLoad(true);
  };

  const initIndexSearch = () => {
    setOmnibarMode('index');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
    setShouldLoad(true);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.length === 0) {
      setSearchResults([]);
      return;
    }
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceAutoComplete(rewritedSearchData, q));
        break;
      case 'index':
        setSearchResults(indexAutoComplete(rewritedSearchData, q));
        break;
    }
  };

  const handleResultClick = (result: string) => {
    setQuery(result);
    setPreviousMode(omnibarMode as Exclude<Mode, 'submenu'>);
    setOmnibarMode('submenu');
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceSearch(rewritedSearchData, result));
        break;
      case 'index':
        setSearchResults(processIndexSearchResults(search(result, rewritedSearchData.indexTrie)));
        break;
    }
  };

  const focusResult = (result: string | undefined, q: string): React.ReactNode => {
    if (!result) {
      return null;
    }
    const normalizedQ = q.toLowerCase();
    result = result.replaceAll('\n', ' ').toLowerCase();
    const startIndex = result.indexOf(normalizedQ);
    if (startIndex === -1) {
      return (
        <>
          {result.slice(0, 100)}
          {result.length > 100 ? '...' : ''}
        </>
      );
    }
    let start = startIndex;
    while (start > 0 && !result[start - 1].match(/[^a-zA-Z, _]/)) {
      start--;
    }
    const endIndex = startIndex + normalizedQ.length;
    let end = endIndex;
    while (end < result.length && !result[end].match(/[^a-zA-Z _,]/)) {
      end++;
    }
    let subStr = result.slice(start, end);
    if (start > 0) {
      subStr = '...' + subStr;
    }
    if (end < result.length) {
      subStr = subStr + '...';
    }
    subStr = subStr.trim();
    return (
      <>
        {subStr.slice(0, subStr.indexOf(normalizedQ))}
        <mark>
          <strong>
            {subStr.slice(
              subStr.indexOf(normalizedQ),
              subStr.indexOf(normalizedQ) + normalizedQ.length,
            )}
          </strong>
        </mark>
        {subStr.slice(subStr.indexOf(normalizedQ) + normalizedQ.length)}
      </>
    );
  };

  const getIndex = (id: string): string => {
    const hashPos = id.indexOf('#');
    return hashPos === -1 ? id : id.slice(0, hashPos);
  };

  const makeTextSearchSubmenuItem = (result: string) => (
    <MenuItem
      multiline
      text={
        <>
          <Tag minimal>Section {getIndex(result)}</Tag>
          <br />
          {focusResult(rewritedSearchData.idToContentMap[result], query)}
        </>
      }
      onClick={() => {
        onNavigate(result);
        setIsOmnibarOpen(false);
      }}
    />
  );

  const makeIndexSearchSubmenuItem = (result: IndexSearchResult) => (
    <MenuItem
      text={<Latex>{result.text.replaceAll('LATEX: ', '')}</Latex>}
      onClick={() => {
        onNavigate(result.id);
        setIsOmnibarOpen(false);
      }}
    />
  );

  const searchWrapper = (
    <div style={{ width: '100%', display: 'flex', gap: 2, justifyContent: 'center' }}>
      <ControlButton label="Text Search" icon={IconNames.SEARCH} onClick={initTextSearch} />
      <ControlButton label="Index Search" icon={IconNames.SEARCH} onClick={initIndexSearch} />
    </div>
  );

  return (
    <>
      <Omnibar
        className="sicp-search-bar"
        isOpen={isOmnibarOpen}
        inputProps={{
          disabled: omnibarMode === 'submenu' || isFetching,
          placeholder: isFetching
            ? 'Loading search data...'
            : `${omnibarMode.charAt(0).toUpperCase()}${omnibarMode.slice(1)} Search...`,
        }}
        overlayProps={{ className: Classes.OVERLAY_SCROLL_CONTAINER }}
        onClose={() => setIsOmnibarOpen(false)}
        items={searchResults}
        onItemSelect={result => {
          switch (omnibarMode) {
            case 'text':
            case 'index':
              if (typeof result === 'string') {
                handleResultClick(result);
              }
              break;
            case 'submenu':
              if (previousMode === 'text' && typeof result === 'string') {
                onNavigate(result);
              } else if (previousMode === 'index' && typeof result !== 'string') {
                onNavigate(result.id);
              }
              setIsOmnibarOpen(false);
              break;
          }
        }}
        query={query}
        onQueryChange={handleQueryChange}
        itemListRenderer={({ itemsParentRef, renderItem, items }) => (
          <Menu ulRef={itemsParentRef}>
            {(omnibarMode === 'text' || omnibarMode === 'index') &&
              (isFetching || error !== null) && (
                <Text className={Classes.TEXT_MUTED} style={{ padding: 6 }}>
                  {isFetching
                    ? 'Loading search data...'
                    : error !== null
                      ? 'Unable to load search data. Please try again.'
                      : ''}
                </Text>
              )}
            {omnibarMode === 'submenu' && (
              <Text className={Classes.TEXT_MUTED} style={{ padding: 6 }}>
                Showing results for <strong>{query}</strong>&hellip;{' '}
                <Button
                  size="small"
                  intent="primary"
                  variant="minimal"
                  style={{ padding: 0, minHeight: 0, verticalAlign: 'baseline' }}
                  onClick={() => {
                    if (previousMode) {
                      setOmnibarMode(previousMode);
                      setPreviousMode(null);
                      switch (previousMode) {
                        case 'text':
                          setSearchResults(sentenceAutoComplete(rewritedSearchData, query));
                          break;
                        case 'index':
                          setSearchResults(indexAutoComplete(rewritedSearchData, query));
                          break;
                      }
                    }
                  }}
                >
                  back to {previousMode} search
                </Button>
              </Text>
            )}
            {items.map(renderItem)}
          </Menu>
        )}
        itemRenderer={(result, { handleClick, modifiers }) => {
          switch (omnibarMode) {
            case 'text':
            case 'index':
              if (typeof result !== 'string') {
                return null;
              }
              return (
                <MenuItem
                  active={modifiers.active}
                  text={result}
                  onClick={handleClick}
                  labelElement={<Icon icon={IconNames.CARET_RIGHT} />}
                />
              );
            case 'submenu':
              switch (previousMode) {
                case 'text':
                  return typeof result === 'string' ? makeTextSearchSubmenuItem(result) : null;
                case 'index':
                  return typeof result !== 'string' ? makeIndexSearchSubmenuItem(result) : null;
                default:
                  return null;
              }
          }
        }}
      />
      {searchWrapper}
    </>
  );
}

export default SearchAutocomplete;
