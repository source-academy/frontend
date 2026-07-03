import {
  Alignment,
  Button,
  Classes,
  Drawer,
  Icon,
  Menu,
  MenuItem,
  Navbar,
  NavbarGroup,
  Position,
  Tag,
  Text,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Omnibar } from '@blueprintjs/select';
import { useEffect, useRef, useState } from 'react';
import Latex from 'react-latex-next';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import Constants from 'src/commons/utils/Constants';
import { getNextPy, getPrevPy } from 'src/features/sicp/TableOfContentsHelperPy';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpPyToc from '../../../pages/sicp/subcomponents/SicpPyToc';
import type { IndexSearchResult, SearchData, TrieNode } from './autocomplete/types';
import {
  indexAutoComplete,
  search,
  sentenceAutoComplete,
  sentenceSearch,
} from './autocomplete/utils';

type SearchResultItem = string | IndexSearchResult;

const emptyTrieNode: TrieNode = { children: {}, value: [] as any, key: '' };
const emptySearchData: SearchData = {
  indexTrie: emptyTrieNode,
  textTrie: emptyTrieNode,
  idToContentMap: {},
};

type SearchDataStatus = 'idle' | 'loading' | 'ready' | 'error';

function SicpPyNavigationBar() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const prev = getPrevPy(section ?? '');
  const next = getNextPy(section ?? '');

  const handleNavigation = (sect: string) => navigate('/sicppy/' + sect);

  const tocButton = <TableOfContentsButton key="toc" handleOpenToc={() => setIsTocOpen(true)} />;

  const prevButton = prev && (
    <div key="prev">
      <ControlButton
        label="Previous"
        icon={IconNames.ARROW_LEFT}
        onClick={() => handleNavigation(prev)}
      />
    </div>
  );

  const nextButton = next && (
    <div key="next">
      <ControlButton
        label="Next"
        icon={IconNames.ARROW_RIGHT}
        onClick={() => handleNavigation(next)}
        options={{ iconOnRight: true }}
      />
    </div>
  );

  const drawerProps = {
    onClose: () => setIsTocOpen(false),
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isTocOpen,
    position: Position.LEFT,
    usePortal: false,
  };

  const [rewritedSearchData, setRewritedSearchData] = useState<SearchData>(emptySearchData);
  const [searchDataStatus, setSearchDataStatus] = useState<SearchDataStatus>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const loadingMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
    };
  }, []);

  // Search data (currently ~5MB) is fetched lazily, only once the user actually opens
  // search, rather than eagerly whenever the textbook is opened.
  const loadSearchData = () => {
    if (searchDataStatus === 'loading' || searchDataStatus === 'ready') return;

    if (process.env.NODE_ENV === 'test') {
      setRewritedSearchData(emptySearchData);
      setSearchDataStatus('ready');
      return;
    }

    setSearchDataStatus('loading');
    setLoadingMessage('...loading search data.');

    const url = Constants.sicpBackendUrl + 'json_py/rewritedSearchData.json';
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Unable to get search data. Error code = ${res.status} url is ${url}`);
        }
        return res.json() as Promise<SearchData>;
      })
      .then(data => {
        setRewritedSearchData(data);
        setSearchDataStatus('ready');
        setLoadingMessage('done');
        loadingMessageTimeoutRef.current = setTimeout(() => setLoadingMessage(null), 800);
      })
      .catch(err => {
        console.error(err);
        setSearchDataStatus('error');
        setLoadingMessage('Unable to load search data. Please try again.');
      });
  };

  const focusResult = (result: string | undefined, q: string): React.ReactNode => {
    if (!result) return null;
    const normalizedQ = q.toLowerCase();
    result = result.replaceAll('\n', ' ').toLowerCase();
    const startIndex = result.indexOf(normalizedQ);
    if (startIndex === -1)
      return (
        <>
          {result.slice(0, 100)}
          {result.length > 100 ? '...' : ''}
        </>
      );
    let start = startIndex;
    while (start > 0 && !result[start - 1].match(/[^a-zA-Z, _]/)) start--;
    const endIndex = startIndex + normalizedQ.length;
    let end = endIndex;
    while (end < result.length && !result[end].match(/[^a-zA-Z _,]/)) end++;
    let subStr = result.slice(start, end);
    if (start > 0) subStr = '...' + subStr;
    if (end < result.length) subStr = subStr + '...';
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

  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [omnibarMode, setOmnibarMode] = useState<'text' | 'index' | 'submenu'>('text');
  const [previousMode, setPreviousMode] = useState<'text' | 'index' | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  const initTextSearch = () => {
    setOmnibarMode('text');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
    loadSearchData();
  };

  const initIndexSearch = () => {
    setOmnibarMode('index');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
    loadSearchData();
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
    setPreviousMode(omnibarMode as 'text' | 'index');
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

  const processIndexSearchResults = (results: IndexSearchResult[]): IndexSearchResult[] =>
    results
      .filter(r => r.id)
      .sort((a, b) => {
        if (a.hasSubindex && !b.hasSubindex) return 1;
        if (!a.hasSubindex && b.hasSubindex) return -1;
        return a.order.localeCompare(b.order);
      });

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
        handleNavigation(result);
        setIsOmnibarOpen(false);
      }}
    />
  );

  const makeIndexSearchSubmenuItem = (result: IndexSearchResult) => (
    <MenuItem
      text={<Latex>{result.text.replaceAll('LATEX: ', '')}</Latex>}
      onClick={() => {
        handleNavigation(result.id);
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
          disabled: omnibarMode === 'submenu' || searchDataStatus === 'loading',
          placeholder:
            searchDataStatus === 'loading'
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
              if (typeof result === 'string') handleResultClick(result);
              break;
            case 'submenu':
              if (previousMode === 'text' && typeof result === 'string') {
                handleNavigation(result);
              } else if (previousMode === 'index' && typeof result !== 'string') {
                handleNavigation(result.id);
              }
              setIsOmnibarOpen(false);
              break;
          }
        }}
        query={query}
        onQueryChange={handleQueryChange}
        itemListRenderer={({ itemsParentRef, renderItem, items }) => (
          <Menu ulRef={itemsParentRef}>
            {(omnibarMode === 'text' || omnibarMode === 'index') && loadingMessage && (
              <Text className={Classes.TEXT_MUTED} style={{ padding: 6 }}>
                {loadingMessage}
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
              if (typeof result !== 'string') return null;
              return (
                <MenuItem
                  active={modifiers.active}
                  text={result}
                  onClick={handleClick}
                  labelElement={<Icon icon={IconNames.CARET_RIGHT} />}
                />
              );
            case 'submenu':
              switch (previousMode!) {
                case 'text':
                  return typeof result === 'string' ? makeTextSearchSubmenuItem(result) : null;
                case 'index':
                  return typeof result !== 'string' ? makeIndexSearchSubmenuItem(result) : null;
              }
          }
        }}
      />
      <Navbar className="SicpNavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.START}>{tocButton}</NavbarGroup>
        <NavbarGroup align={Alignment.END}>{[prevButton, nextButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.CENTER}>{searchWrapper}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpPyToc handleCloseToc={() => setIsTocOpen(false)} />
      </Drawer>
    </>
  );
}

export default SicpPyNavigationBar;
