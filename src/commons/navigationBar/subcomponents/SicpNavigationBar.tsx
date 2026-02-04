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
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Omnibar } from '@blueprintjs/select';
import React from 'react';
import Latex from 'react-latex-next';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import Constants from 'src/commons/utils/Constants';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';

type IndexSearchResult = { text: string; order: string; id: string; hasSubindex: boolean };

const SicpNavigationBar: React.FC = () => {
  // this section responsible for the travel and table of content
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const prev = getPrev(section!);
  const next = getNext(section!);
  const handleCloseToc = () => setIsTocOpen(false);
  const handleOpenToc = () => setIsTocOpen(true);
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
    usePortal: false
  };

  // this section responsible for the search
  type TrieNode = {
    children: Record<string, TrieNode>;
    value: string[] & IndexSearchResult[];
    key: string;
  };

  type SearchData = {
    indexTrie: TrieNode;
    textTrie: TrieNode;
    idToContentMap: Record<string, string>;
  };

  const fetchSearchData = () => {
    const xhr = new XMLHttpRequest();
    const url = Constants.sicpBackendUrl + 'json/rewritedSearchData.json';
    xhr.open('GET', url, false); //sync download
    xhr.send();
    if (xhr.status !== 200) {
      alert('Unable to get rewrited search data. Error code = ' + xhr.status + ' url is ' + url);
      throw new Error('Unable to get search data. Error code = ' + xhr.status + ' url is ' + url);
    } else {
      const searchData: SearchData = JSON.parse(xhr.responseText);
      return searchData;
    }
  };

  function search(keyStr: string, trie: TrieNode) {
    const keys = [...keyStr];
    let node = trie;
    for (let i = 0; i < keys.length; i++) {
      if (node === undefined || node.children === undefined) {
        return [];
      }

      if (!node.children[keys[i]]) {
        return [];
      }
      node = node.children[keys[i]];
    }
    return node.value;
  }

  function sentenceSearch(keyStr: string) {
    const words = keyStr.split(' ');
    const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');
    const results = search(longestWord, rewritedSearchData.textTrie).filter(id => {
      const text = rewritedSearchData.idToContentMap[id].toLowerCase().replaceAll('\n', ' ');
      return text.includes(keyStr);
    });
    return results;
  }

  function autocomplete(incompleteKeys: string, trie: TrieNode, n: number = 25) {
    let node = trie;
    for (let i = 0; i < incompleteKeys.length; i++) {
      if (!node.children[incompleteKeys[i]]) {
        return [];
      }
      node = node.children[incompleteKeys[i]];
    }
    const result = [];
    const queue = [node];
    while (queue.length > 0 && result.length < n) {
      const currNode = queue.shift();
      if (currNode && currNode.value.length > 0) {
        result.push(currNode.key);
      }
      if (currNode && currNode.children) {
        for (const child of Object.values(currNode.children)) {
          queue.push(child);
        }
      }
    }
    return result;
  }
  function indexAutoComplete(incompleteKeys: string, n: number = 25) {
    const firstIsLowerCase = incompleteKeys[0].toLowerCase() + incompleteKeys.slice(1);
    const firstIsUpperCase = incompleteKeys[0].toUpperCase() + incompleteKeys.slice(1);
    const result1 = autocomplete(firstIsLowerCase, rewritedSearchData.indexTrie, n);
    const result2 = autocomplete(firstIsUpperCase, rewritedSearchData.indexTrie, n);
    while (result1.length < n && result2.length > 0) {
      const toPush = result2.shift();
      if (toPush === undefined) {
        console.log('when searching, got undefined toPush');
        continue;
      }
      result1.push(toPush);
    }
    return result1;
  }

  function sentenceAutoComplete(incompleteKeys: string, n: number = 25) {
    const words = incompleteKeys.split(' ');
    if (words.length === 0) {
      return [];
    }
    if (words.length === 1) {
      return autocomplete(words[0], rewritedSearchData.textTrie, n);
    }
    const pre = words.slice(0, -1).join(' ');
    const results = sentenceSearch(pre).map(id =>
      rewritedSearchData.idToContentMap[id].toLowerCase()
    );
    const answers: string[] = [];
    while (answers.length < n && results.length > 0) {
      let sentence = results.shift();
      if (sentence === undefined) {
        continue;
      }
      sentence = sentence.replaceAll('\n', ' ');
      const start = sentence.indexOf(incompleteKeys) + incompleteKeys.length;
      if (start >= incompleteKeys.length) {
        const rest = sentence.slice(start);
        let end = rest.search(/[^a-zA-Z _]/);
        if (end === -1) {
          end = rest.length;
        }
        const toPush = incompleteKeys + rest.slice(0, end);
        if (!answers.includes(toPush.trim())) {
          answers.push(toPush.trim());
        }
      }
    }
    return answers;
  }

  // fetch search catalog only once
  const rewritedSearchData: SearchData = React.useMemo(fetchSearchData, []);

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

  const processIndexSearchResults = (searchResults: IndexSearchResult[]) => {
    return searchResults
      .filter(result => result.id)
      .sort((a, b) => {
        if (a.hasSubindex && !b.hasSubindex) {
          return 1;
        }
        if (!a.hasSubindex && b.hasSubindex) {
          return -1;
        }
        return a.order.localeCompare(b.order);
      });
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

  const [isOmnibarOpen, setIsOmnibarOpen] = React.useState(false);
  const [omnibarMode, setOmnibarMode] = React.useState<'text' | 'index' | 'submenu'>('text');
  const [previousMode, setPreviousMode] = React.useState<'text' | 'index' | null>(null);
  const [query, setQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<string[]>([]);

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
        setSearchResults(sentenceAutoComplete(query));
        break;
      case 'index':
        setSearchResults(indexAutoComplete(query));
        break;
    }
  };

  const userSearch = (
    <ControlButton label="Text Search" icon={IconNames.SEARCH} onClick={initTextSearch} />
  );

  const indexSearch = (
    <ControlButton label="Index Search" icon={IconNames.SEARCH} onClick={initIndexSearch} />
  );

  const searchWrapper = (
    <div style={{ width: '100%', display: 'flex', gap: 2, justifyContent: 'center' }}>
      {userSearch}
      {indexSearch}
    </div>
  );

  const handleResultClick = (result: string) => {
    setQuery(result);
    // Safe to typecast due to logic
    setPreviousMode(omnibarMode as 'text' | 'index');
    setOmnibarMode('submenu');
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceSearch(result));
        break;
      case 'index':
        setSearchResults(
          // Supposed to be IndexSearchResult[], but typing can be improved with further, future refactoring
          processIndexSearchResults(search(result, rewritedSearchData.indexTrie)) as any[]
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
          placeholder: `${omnibarMode.charAt(0).toUpperCase()}${omnibarMode.slice(1)} Search...`
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
                    small
                    intent="primary"
                    minimal
                    style={{ padding: 0, minHeight: 0, verticalAlign: 'baseline' }}
                    onClick={() => {
                      // Safe to assert non-null due to logic
                      setOmnibarMode(previousMode!);
                      setPreviousMode(null);

                      // Restore previous search results
                      switch (previousMode) {
                        case 'text':
                          setSearchResults(sentenceAutoComplete(query));
                          break;
                        case 'index':
                          setSearchResults(indexAutoComplete(query));
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
        <NavbarGroup align={Alignment.LEFT}>{tocButton}</NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>{[prevButton, nextButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.CENTER}>{searchWrapper}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpToc handleCloseToc={handleCloseToc} />
      </Drawer>
    </>
  );
};

export default SicpNavigationBar;
