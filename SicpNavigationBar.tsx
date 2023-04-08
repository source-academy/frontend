import { Alignment, Drawer, InputGroup, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { memoize } from 'lodash';
import * as React from 'react';
//import React, {useEffect} from 'react';
//import Highlighter from 'react-highlight-words';
import { useHistory, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import Constants from 'src/commons/utils/Constants';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';

/**
 * Secondary navbar for SICP, should only be displayed when on pages related to interactive /SICP.
 */
const fetchData = () => {
  const xhr = new XMLHttpRequest();
  const url = Constants.sicpBackendUrl + 'json/searchData.json';
  xhr.open('GET', url, false); //sync download
  xhr.send();
  if (xhr.status !== 200) {
    alert('Unable to get search data. Error code = ' + xhr.status);
    throw new Error('Unable to get search data. Error code = ' + xhr.status);
  }

  const searchData = JSON.parse(xhr.responseText);
  return {
    indexTrie: searchData['indexSearch'],
    textbook: searchData['textbook'],
    textTrie: searchData['userSearch']
  };
};
const memoizedFetchData = memoize(fetchData);

const SicpNavigationBar: React.FC = () => {
  const { indexTrie, textbook, textTrie } = memoizedFetchData();
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const [searchAutocompleteResults, setSearchAutocompleteResults] = React.useState([] as string[]);
  const [displayedQuery, setDisplayedQuery] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [indexSearchQuery, setIndexSearchQuery] = React.useState('');
  const [indexAutocompleteResults, setIndexAutocompleteResults] = React.useState([] as string[]);

  const [queryResult, setQueryResult] = React.useState([{ title: 'no result found', url: '' }]);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const history = useHistory();

  const prev = getPrev(section);
  const next = getNext(section);

  const handleCloseToc = () => setIsTocOpen(false);
  const handleOpenToc = () => setIsTocOpen(true);
  const handleNavigation = (sect: string) => {
    history.push('/sicpjs/' + sect);
  };
  //const handleSearch = () => {};
  const handleOpenSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

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

  const searchDrawerProps = {
    onClose: handleCloseSearch,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isSearchOpen,
    position: Position.LEFT,
    usePortal: false
  };

  function queryIndexTrie(query: string) {
    let node = indexTrie;
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      if (node[char]) {
        node = node[char];
      } else {
        return [];
      }
    }
    if (node['value']) {
      return node['value'];
    }
    return [];
  }

  function queryTextTrie(query: string) {
    let node = textTrie;
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      if (node[char]) {
        node = node[char];
      } else {
        return [];
      }
    }
    if (node['value']) {
      return node['value'];
    }
    return [];
  }

  function autoComplete(str: string, limit: number, jsonData: any) {
    if (str.length === 0) {
      return [];
    }
    str = str.toLowerCase();
    const trie = jsonData;

    function next(node: any, i: number) {
      if (i === 26) return node[' '];
      else if (i >= 0 && i <= 25) {
        return node[String.fromCharCode(i + 97)];
      }
      return null;
    }
    const letters = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      ' '
    ];

    function toEnd(query: any) {
      let node = trie;
      for (let i = 0; i < query.length; i++) {
        const char = query[i];
        if (node[char]) {
          node = node[char];
        } else {
          return null;
        }
      }
      return node;
    }

    function recur(node: any, path: string) {
      if (node == null || limit < 0) {
        return;
      }
      if (node.value) {
        ans.push(path);
        limit--;
      }
      for (let i = 0; i < 27; i++) {
        recur(next(node, i), path + letters[i]);
      }
    }
    const ans = [] as any[];
    recur(toEnd(str), str);
    return ans;
  }

  const voidSearch = (str: string) => {
    function lineMap(array: any[]) {
      if (array == null || array[0] == null || array[1] == null || array[2] == null) {
        return { title: '', url: '' };
      }
      return {
        title: textbook[array[0]][array[1]][array[2]],
        url: SearchUrl + array[0] + array[1]
      };
    }
    const SearchUrl = '..';
    let words = str.toLowerCase().split(' ');
    words = words.filter(word => word !== '');
    if (searchQuery.length === 0 || words.length === 0) {
      setQueryResult([]);
      return;
    }
    let globalAns = queryTextTrie(words[0]).map((array: any) => lineMap(array));

    globalAns = globalAns.filter((obj: any) => obj.title.toLowerCase().includes(str.toLowerCase()));
    return globalAns;
  };

  function sentenceAutoComplete(str: string, limit: number, jsonData: any) {
    const words = str
      .toLowerCase()
      .split(' ')
      .filter(word => word !== '');
    if (words.length < 2) {
      return autoComplete(str, limit, jsonData);
    }
    let pre = words[0];
    for (let i = 1; i < words.length - 1; i++) {
      pre += ' ' + words[i];
    }
    console.log(pre);
    const lastWord = words[words.length - 1];
    let preResults = voidSearch(pre);
    if (preResults == null) {
      return [];
    }
    preResults = preResults.filter((obj: any) => obj.title.includes(lastWord));
    console.log(preResults);
    if (preResults.length < 1) {
      return [];
    }
    let lastwords = autoComplete(lastWord, 3000, jsonData);
    console.log(lastwords);
    lastwords = lastwords.filter(
      (word: string) =>
        preResults.filter((obj: any) => obj.title.toLowerCase().includes(pre + ' ' + word)).length >
        0
    );
    return lastwords.map(word => pre + ' ' + word);
  }

  const handleSearchButton = () => {
    handleOpenSearch();
    setDisplayedQuery(searchQuery);
    setQueryResult(voidSearch(searchQuery));
  };
  const handleAutoSearch = (str: string) => {
    handleOpenSearch();
    setDisplayedQuery(str);
    setQueryResult(voidSearch(str));
    setSearchQuery(str);
  };
  const handleAutoIndexSearch = (str: string) => {
    handleOpenSearch();
    setDisplayedQuery(str);
    const SearchUrl = '..';
    const tem = [];
    const ans = queryIndexTrie(str.toLowerCase());
    if (ans == null) {
      tem.push({ title: 'no result found', url: '' });
    } else {
      const pure = ans['pureIndex'];
      for (let i = 0; i < pure.length; i++) {
        tem.push({ title: ans['value'], url: SearchUrl + pure[i][0] + pure[i][1] });
      }
      const subindex = ans['subIndex'];
      for (let i = 0; i < subindex.length; i++) {
        tem.push({
          title: ans['value'] + ': ' + subindex[i]['value'],
          url: SearchUrl + subindex[i]['id'][0] + subindex[i]['id'][1]
        });
      }
    }
    setQueryResult(tem);
  };

  const handleIndexSearchButton = () => {
    handleOpenSearch();
    setDisplayedQuery(indexSearchQuery);
    const SearchUrl = '..';
    const tem = [];
    const ans = queryIndexTrie(indexSearchQuery.toLowerCase());
    if (ans == null) {
      tem.push({ title: 'no result found', url: '' });
    } else {
      const pure = ans['pureIndex'];
      for (let i = 0; i < pure.length; i++) {
        tem.push({ title: ans['value'], url: SearchUrl + pure[i][0] + pure[i][1] });
      }
      const subindex = ans['subIndex'];
      for (let i = 0; i < subindex.length; i++) {
        tem.push({
          title: ans['value'] + ': ' + subindex[i]['value'],
          url: SearchUrl + subindex[i]['id'][0] + subindex[i]['id'][1]
        });
      }
    }

    setQueryResult(tem);
  };

  const handleUserSearchChange = (s: string) => {
    setSearchQuery(s);
    setSearchAutocompleteResults(sentenceAutoComplete(s, 250, textTrie));
  };

  const handleIndexSearchChange = (s: string) => {
    setIndexSearchQuery(s);
    setIndexAutocompleteResults(autoComplete(s, 250, indexTrie));
  };

  const userSearch = (
    <div
      className="userSearch"
      style={{ position: 'absolute', top: '10%', left: '15%', width: '20%', height: '600%' }}
    >
      <div className="userSearch-inner">
        <div style={{ display: 'inline-flex' }}>
          <InputGroup
            placeholder="..."
            value={searchQuery}
            onChange={event => handleUserSearchChange(event.target.value)}
          />
          <ControlButton
            label="Search"
            icon={IconNames.SEARCH}
            onClick={() => handleSearchButton()}
          />
        </div>
      </div>
      {searchAutocompleteResults.length !== 0 && (
        <div
          className="userSearchDropdown"
          style={{ backgroundColor: 'white', outline: 'dashed', height: '100%', overflow: 'auto' }}
        >
          {searchAutocompleteResults.map((result, index) => (
            <div
              style={{ margin: '2px 2px 3px 3px', cursor: 'pointer' }}
              onClick={() => {
                setSearchQuery(result);
                handleAutoSearch(result);
              }}
              onMouseOver={e => {
                const element = e!.nativeEvent!.srcElement as any;
                element.style.backgroundColor = 'rgba(0,0,0,0.5)';
              }}
              onMouseOut={e => {
                const element = e!.nativeEvent!.srcElement as any;
                element.style.backgroundColor = 'rgba(0,0,0,0)';
              }}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const indexSearch = (
    <div
      className="indexSearch"
      style={{ position: 'absolute', top: '10%', left: '36%', width: '20%', height: '600%' }}
    >
      <div className="indexSearch-inner">
        <div style={{ display: 'inline-flex' }}>
          <InputGroup
            placeholder="..."
            value={indexSearchQuery}
            onChange={event => handleIndexSearchChange(event.target.value)}
          />
          <ControlButton
            label="Search index"
            icon={IconNames.SEARCH}
            onClick={handleIndexSearchButton}
          />
        </div>
      </div>
      {indexAutocompleteResults.length !== 0 && (
        <div
          className="userSearchDropdown"
          style={{ backgroundColor: 'white', outline: 'dashed', height: '100%', overflow: 'auto' }}
        >
          {indexAutocompleteResults.map(result => (
            <div
              style={{ margin: '2px 2px 3px 3px', cursor: 'pointer' }}
              onClick={() => {
                setIndexSearchQuery(result);
                handleAutoIndexSearch(result);
              }}
              onMouseOver={e => {
                console.log(e);
                const element = e!.nativeEvent!.srcElement as any;
                element.style.backgroundColor = 'rgba(0,0,0,0.5)';
              }}
              onMouseOut={e => {
                console.log(e);
                const element = e!.nativeEvent!.srcElement as any;
                element.style.backgroundColor = 'rgba(0,0,0,0)';
              }}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const searchResultsProps = {
    query: displayedQuery,
    results: queryResult,
    handleCloseSearch: handleCloseSearch
  };

  type SearchResultProps = {
    title: any;
    url: any;
  };

  type SearchResultsProps = {
    query: string;
    results: Array<SearchResultProps>;
    handleCloseSearch: () => void;
  };

  const SearchResult: React.FC<SearchResultProps> = ({ title, url }) => {
    return (
      <li>
        <a href={url}>{title}</a>
      </li>
    );
  };

  const SearchResults: React.FC<SearchResultsProps> = ({ query, results, handleCloseSearch }) => {
    const highlightedResults = results.map((result, index) => {
      const regex = new RegExp(`(${query})`, 'gi');
      const titleParts = result.title.split(regex);
      const highlightedTitle = titleParts.map((part: any, i: any) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return <mark key={i}>{part}</mark>;
        } else {
          return part;
        }
      });
      return { ...result, title: highlightedTitle };
    });

    return (
      <div>
        <h3>Results for "{query}"</h3>
        <ul>
          {highlightedResults.map((result, index) => (
            <SearchResult key={index} {...result} />
          ))}
        </ul>
        <button onClick={handleCloseSearch}>Close</button>
      </div>
    );
  };

  return (
    <>
      <Navbar className="SicpNavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.LEFT}>{[tocButton, userSearch, indexSearch]}</NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>{[prevButton, nextButton]}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpToc handleCloseToc={handleCloseToc} />
      </Drawer>
      <Drawer style={{ overflow: 'auto' }} {...searchDrawerProps} className="sicp-toc-drawer">
        {isSearchOpen && <SearchResults {...searchResultsProps} />}
      </Drawer>
    </>
  );
};

export default SicpNavigationBar;
