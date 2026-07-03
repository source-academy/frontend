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
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Latex from 'react-latex-next';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';
import { emptySearchData, fetchSicpSearchData } from './autocomplete/query';
import { processIndexSearchResults } from './autocomplete/renderUtils';
import type { IndexSearchResult } from './autocomplete/types';
import {
  indexAutoComplete,
  search,
  sentenceAutoComplete,
  sentenceSearch,
} from './autocomplete/utils';

function SicpNavigationBar() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const prev = getPrev(section ?? '');
  const next = getNext(section ?? '');

  const handleOpenToc = () => setIsTocOpen(true);
  const handleCloseToc = () => setIsTocOpen(false);

  const handleNavigation = (sect: string) => {
    navigate('/sicpjs/' + sect);
  };

  // Button to open table of contents
  const tocButton = <TableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;

  // Previous button only displayed when next page is valid.
  const prevButton = prev && (
    <div key="prev">
      <ControlButton
        label="Previous"
        icon={IconNames.ARROW_LEFT}
        onClick={() => handleNavigation(prev)}
      />
    </div>
  );

  // Next button only displayed when next page is valid.
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
    onClose: handleCloseToc,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isTocOpen,
    position: Position.LEFT,
    usePortal: false,
  };

  const { data: rewritedSearchData } = useQuery({
    queryKey: ['sicpSearchData'],
    queryFn: fetchSicpSearchData,
    initialData: emptySearchData,
  });

  const focusResult = (result: string, query: string): React.ReactNode => {
    result = result.replaceAll('\n', ' ').toLowerCase();
    const startIndex = result.indexOf(query);
    let start = startIndex;
    while (start > 0) {
      if (result[start - 1].match(/[^a-zA-Z, _]/)) {
        break;
      }
      start--;
    }
    const endIndex = startIndex + query.length;
    let end = endIndex;
    while (end < result.length) {
      if (result[end].match(/[^a-zA-Z _,]/)) {
        break;
      }
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
        {subStr.slice(0, subStr.indexOf(query))}
        <mark>
          <strong>
            {subStr.slice(subStr.indexOf(query), subStr.indexOf(query) + query.length)}
          </strong>
        </mark>
        {subStr.slice(subStr.indexOf(query) + query.length)}
      </>
    );
  };
  const getIndex = (id: string) => {
    const index = id.indexOf('#');
    const numId = index === -1 ? id : id.slice(0, index);
    return numId;
  };

  const makeTextSearchSubmenuItem = (result: string) => {
    return (
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
  };

  const makeIndexSearchSubmenuItem = (result: IndexSearchResult) => {
    return (
      <MenuItem
        text={<Latex>{result.text.replaceAll('LATEX: ', '')}</Latex>}
        onClick={() => {
          handleNavigation(result.id);
          setIsOmnibarOpen(false);
        }}
      />
    );
  };

  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [omnibarMode, setOmnibarMode] = useState<'text' | 'index' | 'submenu'>('text');
  const [previousMode, setPreviousMode] = useState<'text' | 'index' | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const initTextSearch = () => {
    setOmnibarMode('text');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
  };

  const initIndexSearch = () => {
    setOmnibarMode('index');
    setIsOmnibarOpen(true);
    setQuery('');
    setSearchResults([]);
  };

  const handleQueryChange = (query: string) => {
    setQuery(query);
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceAutoComplete(rewritedSearchData, query));
        break;
      case 'index':
        setSearchResults(indexAutoComplete(rewritedSearchData, query));
        break;
    }
  };

  const searchWrapper = (
    <div style={{ width: '100%', display: 'flex', gap: 2, justifyContent: 'center' }}>
      <ControlButton label="Text Search" icon={IconNames.SEARCH} onClick={initTextSearch} />
      <ControlButton label="Index Search" icon={IconNames.SEARCH} onClick={initIndexSearch} />
    </div>
  );

  const handleResultClick = (result: string) => {
    setQuery(result);
    // Safe to typecast due to logic
    setPreviousMode(omnibarMode as 'text' | 'index');
    setOmnibarMode('submenu');
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceSearch(rewritedSearchData, result));
        break;
      case 'index':
        setSearchResults(
          // Supposed to be IndexSearchResult[], but typing can be improved with further, future refactoring
          processIndexSearchResults(search(result, rewritedSearchData.indexTrie)) as any[],
        );
        break;
    }
  };

  return (
    <>
      <Omnibar
        className="sicp-search-bar"
        isOpen={isOmnibarOpen}
        inputProps={{
          disabled: omnibarMode === 'submenu',
          placeholder: `${omnibarMode.charAt(0).toUpperCase()}${omnibarMode.slice(1)} Search...`,
        }}
        overlayProps={{ className: Classes.OVERLAY_SCROLL_CONTAINER }}
        onClose={() => setIsOmnibarOpen(false)}
        items={searchResults}
        // Handled by individual items
        onItemSelect={() => {}}
        query={query}
        onQueryChange={handleQueryChange}
        itemListRenderer={({ itemsParentRef, renderItem, items }) => {
          return (
            <Menu ulRef={itemsParentRef}>
              {omnibarMode === 'submenu' && (
                <Text className={Classes.TEXT_MUTED} style={{ padding: 6 }}>
                  Showing results for <strong>{query}</strong>&hellip;{' '}
                  <Button
                    size="small"
                    intent="primary"
                    variant="minimal"
                    style={{ padding: 0, minHeight: 0, verticalAlign: 'baseline' }}
                    onClick={() => {
                      // Safe to assert non-null due to logic
                      setOmnibarMode(previousMode!);
                      setPreviousMode(null);

                      // Restore previous search results
                      switch (previousMode) {
                        case 'text':
                          setSearchResults(sentenceAutoComplete(rewritedSearchData, query));
                          break;
                        case 'index':
                          setSearchResults(indexAutoComplete(rewritedSearchData, query));
                          break;
                      }
                    }}
                  >
                    back to {previousMode} search
                  </Button>
                </Text>
              )}
              {items.map(renderItem)}
            </Menu>
          );
        }}
        itemRenderer={result => {
          switch (omnibarMode) {
            case 'text':
            case 'index':
              return (
                <MenuItem
                  text={result}
                  onClick={() => handleResultClick(result)}
                  labelElement={<Icon icon={IconNames.CARET_RIGHT} />}
                />
              );
            case 'submenu':
              // Safe to assert non-null due to logic
              switch (previousMode!) {
                case 'text':
                  return makeTextSearchSubmenuItem(result);
                case 'index':
                  return makeIndexSearchSubmenuItem(result as unknown as IndexSearchResult);
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
        <SicpToc handleCloseToc={handleCloseToc} />
      </Drawer>
    </>
  );
}

export default SicpNavigationBar;
