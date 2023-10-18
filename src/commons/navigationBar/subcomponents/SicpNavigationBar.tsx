import { Alignment, Drawer, InputGroup, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { memoize } from 'lodash';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
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


// start of rewrited portion

type TrieNode = {
  children: Record<string, TrieNode>;
  value: any[]; 
  key: string;
};

type SearchData = {
  indexTrie: TrieNode;
  textTrie: TrieNode;
  idToContentMap: Record<string, string>;
};

const fetchSearchData = () => {
  const xhr = new XMLHttpRequest();
  //todo replace this with real url
  const url = "http://127.0.0.1:8080/json/rewritedSearchData.json";
  xhr.open('GET', url, false); //sync download
  xhr.send();
  if (xhr.status !== 200) {
    alert('Unable to get rewrited search data. Error code = ' + xhr.status + ' url is ' + url);
    throw new Error('Unable to get search data. Error code = ' + xhr.status + ' url is ' + url);
  } else {
    const searchData:SearchData = JSON.parse(xhr.responseText);
    return searchData;
  }
};
// todo, remove old search and autocomplete funcitons and properly rename the new ones
// todo, debug the url of the text search
function search1(keyStr:String, trie:TrieNode) {
  const keys = [...keyStr];
  let node = trie;
  for (let i = 0; i < keys.length; i++) {
      if(node === undefined || node.children === undefined) {
          console.log("when searching, got undefined node or node.children");
          console.log("i is " + i);
          return [];
      }

      if (!node.children[keys[i]]) {
          return [];
      }
      node = node.children[keys[i]];
  }
  return node.value;
}

function autoComplete1(incompleteKeys:String, trie:TrieNode, n:number = 30) {
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


// end of rewrited portion

// FIXME: Remove this any type
function queryTrie(startingNode: any, query: string) {
  let node = startingNode;
  for (const char of query) {
    if (node[char]) {
      node = node[char];
    } else {
      return [];
    }
  }
  return node.value || [];
}

type SearchResultProps = {
  title: string;
  url: string;
};

type SearchResultsProps = {
  query: string;
  results: Array<SearchResultProps>;
  handleCloseSearch: () => void;
};

const SicpNavigationBar: React.FC = () => {
  const rewritedSearchData:SearchData = memoize(fetchSearchData)();
  //console.log(rewritedSearchData.idToContentMap["1#h1"])
  const [focusedSearchResultIndex, setFocusedSearchResultIndex] = React.useState<number>(-1);
  const [focusedIndexSearchResultIndex, setFocusedIndexSearchResultIndex] = React.useState<number>(-1);
  const { indexTrie, textbook, textTrie } = memoizedFetchData();
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const [searchAutocompleteResults, setSearchAutocompleteResults] = React.useState<string[]>([]);
  const [indexAutocompleteResults, setIndexAutocompleteResults] = React.useState<string[]>([]);
  const [displayedQuery, setDisplayedQuery] = React.useState('');
  //const [displayedIndexQuery, setDisplayedIndexQuery] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [indexSearchQuery, setIndexSearchQuery] = React.useState('');
  const [queryResult, setQueryResult] = React.useState<SearchResultProps[]>([
    { title: 'no result found', url: '' }
  ]);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState('');
  const [isSubmenuVisibleIndex, setIsSubmenuVisibleIndex] = React.useState('');
  const navigate = useNavigate();

  // `section` is defined due to the navigate logic in the useEffect in Sicp.tsx
  const prev = getPrev(section!);
  const next = getNext(section!);

  const handleCloseToc = () => setIsTocOpen(false);
  const handleOpenToc = () => setIsTocOpen(true);
  const handleNavigation = (sect: string) => {
    navigate('/sicpjs/' + sect);
  };
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

  const voidSearch = (query: string): SearchResultProps[] => {
    function toSearchResult(array: any[]): SearchResultProps {
      if (array == null || array[0] == null || array[1] == null || array[2] == null) {
        return { title: '', url: '' };
      }
      return {
        //  array[0] is sth like /sicpjs/3.3.3; slice out the /sicpjs/
        title: array[0].slice(8) + ': ' + textbook[array[0]][array[1]][array[2]],
        url: SearchUrl + array[0] + array[1]
      };
    }
    const SearchUrl = '..';
    const words = query
      .toLowerCase()
      .split(' ')
      .filter(word => word !== '');
    if (words.length === 0) {
      setQueryResult([]);
      return [];
    }
    return queryTrie(textTrie, words[0])
      .map(toSearchResult)
      .filter((obj: SearchResultProps) => obj.title.toLowerCase().includes(query.toLowerCase()));
  };
  /*
  function sentenceAutoComplete(query: string, limit: number, trie: any): string[] {
    const words = query
      .toLowerCase()
      .split(' ')
      .filter(word => word !== '');
    if (words.length < 2) {
      return autoComplete(query, 250, trie);
    }
    const pre = words.slice(0, -1).join(' ');
    const lastWord = words[words.length - 1];
    const preResults = voidSearch(pre).filter((obj: any) => obj.title.includes(lastWord));
    if (preResults.length === 0) {
      return [];
    }
    const lastwords = autoComplete(lastWord, 3000, trie);
    return lastwords
      .filter(
        word =>
          // Not sure why the length attribute is accessed here
          preResults.filter(obj => obj.title.toLowerCase().includes(`${pre} ${word}`)).length > 0
      )
      .map(word => pre + ' ' + word);
  }
  */
  const handleSearchButton = () => {
    handleOpenSearch();
    setDisplayedQuery(searchQuery);
    setQueryResult(voidSearch(searchQuery));
  };
  /*
  const handleAutoSearch = (str: string) => {
    handleOpenSearch();
    setDisplayedQuery(str);
    setQueryResult(voidSearch(str));
    setSearchQuery(str);
  };
  */


  const handleIndexSearchButton = (str: string) => {
    handleOpenSearch();
    setDisplayedQuery(str);
    const SearchUrl = '..';
    const tem = [];
    const ans = queryTrie(indexTrie, str.toLowerCase());
    if (ans == null) {
      tem.push({ title: 'no result found', url: '' });
    } else {
      const pure = ans['pureIndex'];
      for (let i = 0; i < pure.length; i++) {
        // pure[i][0] is sth like /sicpjs/3.3.3; slice out the /sicpjs/
        tem.push({
          title: pure[i][0].slice(8) + ': ' + ans['value'],
          url: SearchUrl + pure[i][0] + pure[i][1]
        });
      }
      const subindex = ans['subIndex'];
      for (let i = 0; i < subindex.length; i++) {
        tem.push({
          title: subindex[i]['id'][0].slice(8) + ': ' + ans['value'] + ': ' + subindex[i]['value'],
          url: SearchUrl + subindex[i]['id'][0] + subindex[i]['id'][1]
        });
      }
    }

    setQueryResult(tem);
  };
  
  const [results, setResults] = React.useState(["result1", "result2", "result3"]);
  const [resultsIndex, setResultsIndex] = React.useState([{text:"", order:"", id:"", hasSubindex: false}]);
  // debug; use a state selected auto complete result to display the submenu, use cursor on to reset it
  const userSearch = (
    <div className="userSearch" style={{ position: 'relative' }} key="userSearch">
      <div className="userSearch-inner">
        <div style={{ display: 'inline-flex' }}>
          <InputGroup
            placeholder="Search"
            value={searchQuery}
            onChange={event => {
              const s = event.target.value;
              setSearchQuery(s);
              setSearchAutocompleteResults(autoComplete1(s,rewritedSearchData.textTrie));
            }}
          />
          <ControlButton
            label="Text"
            icon={IconNames.SEARCH}
            onClick={() => handleSearchButton()}
          />
        </div>
      </div>
      {searchAutocompleteResults.length !== 0 && (
        <div
          className="userSearchDropdown"
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            outline: 'dashed',
            width: '75%',
          }}
        >
          {searchAutocompleteResults.map((result, index) => (
            <div
              style={{
                margin: 0,
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
              }}
            >
              <div style={{width: "100%", backgroundColor: isSubmenuVisible!==result?'white':'grey',}} 
              onMouseOver={() => {
                // todo: this works but is juggy, how could only compute when mouse stay for a while
                setSearchQuery(result);
                setFocusedSearchResultIndex(-1);
                setResults(search1(result, rewritedSearchData.textTrie));
                setIsSubmenuVisible(result);
              }}
               >
              {result}
              </div >
              {/* Submenu */}
              {isSubmenuVisible === result 
              && (() =>{
                //for debug purpose
                console.log("line 411 onwards is executed"); 
                return true;})() 
              && (
                <ul
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    width: '800px', // Adjust the submenu width as needed
                    backgroundColor: 'white',
                    outline: 'dashed',
                    overflow: 'auto',
                    margin: 0,
                    padding: 0,
                  }}
                  onClick={() => {console.log("ul is clicked, line 428")}}
                > 
                  {results.map((result, index) => {
                    return <div 
                            style={{ margin: '5px 0', width: "100%", backgroundColor: focusedSearchResultIndex!==index?'white':'grey',}} 
                            key={index} 
                            onClick={() => {
                              window.location.href = 'http://localhost:8000/sicpjs/' + result;
                            }}
                            onMouseOver={() => setFocusedSearchResultIndex(index)}
                            >
                              {rewritedSearchData.idToContentMap[result]}
                            </div>;
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
 //todo: debug, the id of some search result is undefined
  const indexSearch = (
    <div className="indexSearch" style={{ position: 'relative' }} key="indexSearch">
      <div className="indexSearch-inner">
        <div style={{ display: 'inline-flex' }}>
          <InputGroup
            placeholder="Search"
            value={indexSearchQuery}
            onChange={event => {
              const s = event.target.value;
              setIndexSearchQuery(s);
              setIndexAutocompleteResults(autoComplete1(s, rewritedSearchData.indexTrie));
            }}
          />
          <ControlButton
            label="Index"
            icon={IconNames.SEARCH}
            // todo, to modify
            onClick={() => handleIndexSearchButton(indexSearchQuery)}
          />
        </div>
        </div>
      {indexAutocompleteResults.length !== 0 && (
        <div
          className="userSearchDropdown"
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            outline: 'dashed',
            width: '75%',
          }}
        >
          {indexAutocompleteResults.map((result, index) => (
            <div
              style={{
                margin: 0,
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
              }}
            >
              <div style={{width: "100%", backgroundColor: isSubmenuVisible!==result?'white':'grey',}} 
              onMouseOver={() => {
                // todo: this works but is juggy, how could only compute when mouse stay for a while
                setIndexSearchQuery(result);
                setFocusedIndexSearchResultIndex(-1);
                setResultsIndex(search1(result, rewritedSearchData.indexTrie));
                setIsSubmenuVisibleIndex(result);
              }}
               >
              {result}
              </div >
              {/* Submenu */}
              {isSubmenuVisibleIndex === result 
              && (() =>{
                //for debug purpose
                console.log("line 462 onwards is executed");
                return true;})() 
              && (
                <ul
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    width: '200%', // Adjust the submenu width as needed
                    backgroundColor: 'white',
                    outline: 'dashed',
                    overflow: 'auto',
                    margin: 0,
                    padding: 0,
                  }}
                  onClick={() => {console.log("ul is clicked, line 477")}}
                > 
                  {resultsIndex.filter((result) => result.id)
                               .sort((a, b) => {
                                if (a.hasSubindex && !b.hasSubindex) {
                                  return 1;
                                }
                                if (!a.hasSubindex && b.hasSubindex) {
                                  return -1;
                                }
                                return a.order.localeCompare(b.order);
                              })
                               .map((result, index) => {
                    return <div 
                            style={{ margin: '5px 0', width: "100%", backgroundColor: focusedIndexSearchResultIndex!==index?'white':'grey',}} 
                            key={index} 
                            onClick={() => {
                              window.location.href = 'http://localhost:8000/sicpjs/' + result.id;
                            }}
                            onMouseOver={() => setFocusedIndexSearchResultIndex(index)}
                            >
                              {result.text}
                            </div>;
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const searchWrapper = (
    <div
      className="searchWrapper"
      style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
      key="searchWrapper"
    >
      {[userSearch, indexSearch]}
    </div>
  );

  const searchResultsProps = {
    query: displayedQuery,
    results: queryResult,
    handleCloseSearch: handleCloseSearch
  };

  // TODO: Remove nested component
  const SearchResults: React.FC<SearchResultsProps> = ({ query, results, handleCloseSearch }) => {
    const highlightedResults = results.map((result, index) => {
      const regex = new RegExp(`(${query})`, 'gi');
      const titleParts = result.title.split(regex);
      const highlightedTitle = titleParts.map((part, i) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          // TODO: Use a guaranteed unique value (not the index) as the key
          return <mark key={i}>{part}</mark>;
        } else {
          return <>{part}</>;
        }
      });
      return { ...result, title: highlightedTitle };
    });

    return (
      <div>
        <h3>Results for "{query}"</h3>
        <ul>
          {highlightedResults.map(result => (
            <li>
              <a href={result.url}>{result.title}</a>
            </li>
          ))}
        </ul>
        <button onClick={handleCloseSearch}>Close</button>
      </div>
    );
  };

  return (
    <>
      <Navbar className="SicpNavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.LEFT}>{tocButton}</NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>{[prevButton, nextButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.CENTER}>{searchWrapper}</NavbarGroup>
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
