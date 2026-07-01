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
import { useMemo, useState } from 'react';
import Latex from 'react-latex-next';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import Constants from 'src/commons/utils/Constants';
import { getNextPy, getPrevPy } from 'src/features/sicp/TableOfContentsHelperPy';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpPyToc from '../../../pages/sicp/subcomponents/SicpPyToc';

type IndexSearchResult = { text: string; order: string; id: string; hasSubindex: boolean };

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

  const rewritedSearchData: SearchData = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      const emptyTrie: TrieNode = { children: {}, value: [] as any, key: '' };
      return { indexTrie: emptyTrie, textTrie: emptyTrie, idToContentMap: {} };
    }

    const xhr = new XMLHttpRequest();
    const url = Constants.sicpBackendUrl + 'json_py/rewritedSearchData.json';
    xhr.open('GET', url, false);
    xhr.send();
    if (xhr.status !== 200) {
      alert('Unable to get search data. Error code = ' + xhr.status + ' url is ' + url);
      throw new Error('Unable to get search data. Error code = ' + xhr.status + ' url is ' + url);
    }
    return JSON.parse(xhr.responseText) as SearchData;
  }, []);

  function trieLookup(keyStr: string, trie: TrieNode): any[] {
    let node = trie;
    for (const ch of keyStr) {
      if (!node?.children?.[ch]) return [];
      node = node.children[ch];
    }
    return node.value;
  }

  function autocomplete(prefix: string, trie: TrieNode, n: number = 25): string[] {
    let node = trie;
    for (const ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    const result: string[] = [];
    const queue: TrieNode[] = [node];
    while (queue.length > 0 && result.length < n) {
      const curr = queue.shift()!;
      if (curr.value.length > 0) result.push(curr.key);
      for (const child of Object.values(curr.children)) queue.push(child);
    }
    return result;
  }

  function indexAutoComplete(prefix: string, n: number = 25): string[] {
    const lower = prefix[0].toLowerCase() + prefix.slice(1);
    const upper = prefix[0].toUpperCase() + prefix.slice(1);
    const result = autocomplete(lower, rewritedSearchData.indexTrie, n);
    const extra = autocomplete(upper, rewritedSearchData.indexTrie, n);
    while (result.length < n && extra.length > 0) result.push(extra.shift()!);
    return result;
  }

  function sentenceSearch(keyStr: string): string[] {
    const words = keyStr.split(' ');
    const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');
    return trieLookup(longestWord, rewritedSearchData.textTrie).filter(id => {
      const text = rewritedSearchData.idToContentMap[id].toLowerCase().replaceAll('\n', ' ');
      return text.includes(keyStr);
    });
  }

  function sentenceAutoComplete(prefix: string, n: number = 25): string[] {
    const words = prefix.split(' ');
    if (words.length === 0) return [];
    if (words.length === 1) return autocomplete(words[0], rewritedSearchData.textTrie, n);

    const pre = words.slice(0, -1).join(' ');
    const results = sentenceSearch(pre).map(id =>
      rewritedSearchData.idToContentMap[id].toLowerCase(),
    );
    const answers: string[] = [];
    while (answers.length < n && results.length > 0) {
      let sentence = results.shift();
      if (!sentence) continue;
      sentence = sentence.replaceAll('\n', ' ');
      const start = sentence.indexOf(prefix) + prefix.length;
      if (start >= prefix.length) {
        const rest = sentence.slice(start);
        let end = rest.search(/[^a-zA-Z _]/);
        if (end === -1) end = rest.length;
        const toPush = (prefix + rest.slice(0, end)).trim();
        if (!answers.includes(toPush)) answers.push(toPush);
      }
    }
    return answers;
  }

  const focusResult = (result: string, q: string): React.ReactNode => {
    result = result.replaceAll('\n', ' ').toLowerCase();
    const startIndex = result.indexOf(q);
    let start = startIndex;
    while (start > 0 && !result[start - 1].match(/[^a-zA-Z, _]/)) start--;
    const endIndex = startIndex + q.length;
    let end = endIndex;
    while (end < result.length && !result[end].match(/[^a-zA-Z _,]/)) end++;
    let subStr = result.slice(start, end);
    if (start > 0) subStr = '...' + subStr;
    if (end < result.length) subStr = subStr + '...';
    subStr = subStr.trim();
    return (
      <>
        {subStr.slice(0, subStr.indexOf(q))}
        <mark>
          <strong>{subStr.slice(subStr.indexOf(q), subStr.indexOf(q) + q.length)}</strong>
        </mark>
        {subStr.slice(subStr.indexOf(q) + q.length)}
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

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.length === 0) {
      setSearchResults([]);
      return;
    }
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceAutoComplete(q));
        break;
      case 'index':
        setSearchResults(indexAutoComplete(q));
        break;
    }
  };

  const handleResultClick = (result: string) => {
    setQuery(result);
    setPreviousMode(omnibarMode as 'text' | 'index');
    setOmnibarMode('submenu');
    switch (omnibarMode) {
      case 'text':
        setSearchResults(sentenceSearch(result));
        break;
      case 'index':
        setSearchResults(
          processIndexSearchResults(trieLookup(result, rewritedSearchData.indexTrie)) as any[],
        );
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
          disabled: omnibarMode === 'submenu',
          placeholder: `${omnibarMode.charAt(0).toUpperCase()}${omnibarMode.slice(1)} Search...`,
        }}
        overlayProps={{ className: Classes.OVERLAY_SCROLL_CONTAINER }}
        onClose={() => setIsOmnibarOpen(false)}
        items={searchResults}
        onItemSelect={() => {}}
        query={query}
        onQueryChange={handleQueryChange}
        itemListRenderer={({ itemsParentRef, renderItem, items }) => (
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
                    setOmnibarMode(previousMode!);
                    setPreviousMode(null);
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
        )}
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
        <SicpPyToc handleCloseToc={() => setIsTocOpen(false)} />
      </Drawer>
    </>
  );
}

export default SicpPyNavigationBar;
