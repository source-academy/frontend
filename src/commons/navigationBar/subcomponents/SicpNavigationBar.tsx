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




const SicpNavigationBar: React.FC = () => {
  // this section responsible for the travel and table of content
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const prev = getPrev(section!);
  const next = getNext(section!);
  const handleCloseToc = () => setIsTocOpen(false);
  const handleOpenToc = () => setIsTocOpen(true);
  const handleNavigation = (sect: string) => {navigate('/sicpjs/' + sect);};
 
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


  /*
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
  // this section responsible for the search
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
    const url = Constants.sicpBackendUrl + "json/rewritedSearchData.json";
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

  function search(keyStr:String, trie:TrieNode) {
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

  function sentenceSearch(keyStr:string) {
    const words = keyStr.split(" ");
    const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, "");
    const results = search(longestWord, rewritedSearchData.textTrie)
                     .map((id) => ({text:rewritedSearchData.idToContentMap[id].toLowerCase(), id: id}))
                     .filter((result) => result.text.includes(keyStr))
                     .map((result) => result.id);
    return results;
  }

  function autocomplete(incompleteKeys:String, trie:TrieNode, n:number = 25) {
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

  function sentenceAutoComplete(incompleteKeys:string, n:number = 25) {
    const words = incompleteKeys.split(" ").filter((word) => word.length > 0);
    if(words.length === 0) {
      return [];
    }
    if(words.length === 1) {
      return autocomplete(words[0], rewritedSearchData.textTrie, n);
    }
    
    const results = sentenceSearch(incompleteKeys).map((id) => rewritedSearchData.idToContentMap[id].toLowerCase());
    const answers:string[] = [];
    const find = (sentence:string) => {
      if(n <= answers.length) {
        return;
      }
      const start = sentence.indexOf(incompleteKeys) + incompleteKeys.length;
      if (start >= incompleteKeys.length) {
        const rest = sentence.slice(start);
        // find the index of first non-alphabet character in rest
        let end = rest.search(/[^a-zA-Z]/);
        if (end === -1) {
          end = rest.length;
        }
        const toPush = incompleteKeys + rest.slice(0, end);
        if(!answers.includes(toPush)) {
        answers.push(toPush);
        }
        find(sentence.slice(end));
      }
    }

    for (const result of results) {
      find(result);
    }
    return answers;
  }

  const rewritedSearchData:SearchData = memoize(fetchSearchData)();
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState('');
  const [isSubmenuVisibleIndex, setIsSubmenuVisibleIndex] = React.useState('');
  const [results, setResults] = React.useState([""]);
  const [resultsIndex, setResultsIndex] = React.useState([{text:"", order:"", id:"", hasSubindex: false}]);
  const [focusedSearchResultIndex, setFocusedSearchResultIndex] = React.useState<number>(-1);
  const [focusedIndexSearchResultIndex, setFocusedIndexSearchResultIndex] = React.useState<number>(-1);
  const [searchAutocompleteResults, setSearchAutocompleteResults] = React.useState<string[]>([]);
  const [indexAutocompleteResults, setIndexAutocompleteResults] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [indexSearchQuery, setIndexSearchQuery] = React.useState('');
 
  const menu = (searchInput:string,
                  isSubMenueHidden:(searchInput: string) => Boolean, 
                  getResults:() => any[],
                  buildMenuEntry: (searchResult:any, index:number) => React.ReactNode,
                  buildMenuWith:(children:React.ReactNode) => React.ReactNode) => {
                    if(isSubMenueHidden(searchInput)) {
                      return (<></>);
                    } 
                    const children = getResults().map((buildMenuEntry))
                    return buildMenuWith(children);
                  } 
    
  const userSearchResultSubMenu = (searchInput: string) => {

      const isUserSearchSubMenuHidden = (searchInput: string) => {
        return !(isSubmenuVisible === searchInput);
      }

      const getUserSearchResults = () => {
        return results;
      }

      const buildUserSearchResultsMenuEntry = (result:any, index:number) => (
        <div 
          style={{ margin: '5px 0', width: "100%", backgroundColor: focusedSearchResultIndex!==index?'white':'grey',}} 
          key={index} 
          onClick={() => {window.location.href = "https://sourceacademy.nus.edu.sg/sicpjs/" + result;}}
          onMouseOver={() => setFocusedSearchResultIndex(index)}>
            {rewritedSearchData.idToContentMap[result]}
        </div>
      );

      const buildSearchResultsMenuWith = (children:React.ReactNode) => {
        return (<div
                style={{
                height: '4000%',
                overflowY: 'auto',
                position: 'absolute',
                top: `0`,
                left: '100%',
                width: '300%', 
                backgroundColor: 'white',
                outline: 'dashed',
                overflow: 'auto',
                margin: 0,
                padding: 0,
                }}>
                {children}
                </div>
          );
              }
    

      return menu(searchInput,
                 isUserSearchSubMenuHidden,
                 getUserSearchResults,
                 buildUserSearchResultsMenuEntry,
                 buildSearchResultsMenuWith);
      }

  const indexSearchResultSubMenu = (searchInput: string) => {
      const isIndexSearchSubMenuHidden = (searchInput: String) => {
        return !(isSubmenuVisibleIndex === searchInput)
      }

      const getIndexSearchResults = () => {
        return resultsIndex.filter((result) => result.id).sort((a, b) => {
          if (a.hasSubindex && !b.hasSubindex) {
            return 1;
          }
          if (!a.hasSubindex && b.hasSubindex) {
            return -1;
          }
          return a.order.localeCompare(b.order);
         });
      }

      const buildIndexSearchResultsMenuEntry = (result:any, index:number) => (
        <div 
            style={{ margin: '5px 0', width: "100%", backgroundColor: focusedIndexSearchResultIndex!==index?'white':'grey',}} 
            key={index} 
            onClick={() => {window.location.href = "https://sourceacademy.nus.edu.sg/sicpjs/" + result.id;}}
            onMouseOver={() => setFocusedIndexSearchResultIndex(index)}>
              {result.text}
        </div>
      );

      const buildIndexSearchResultsMenuWith = (children:React.ReactNode) => {
        return (<div
                style={{
                height: '4000%',
                overflowY: 'auto',
                position: 'absolute',
                top: `0`,
                left: '100%',
                width: '200%', 
                backgroundColor: 'white',
                outline: 'dashed',
                overflow: 'auto',
                margin: 0,
                padding: 0,
                }}>
                {children}
                </div>
          );
              }

      return menu(searchInput,
                 isIndexSearchSubMenuHidden,
                 getIndexSearchResults,
                 buildIndexSearchResultsMenuEntry,
                 buildIndexSearchResultsMenuWith);
      }

  const userSearchAutocompleteMenu = (searchInput: string) => {
      const isUserSearchAutocompleteMenuHidden = (searchInput: string) => {
        return searchAutocompleteResults.length === 0
      }

      const getUserSearchAutocompleteResults = () => {
        return searchAutocompleteResults;
      }

      const buildUserSearchAutocompleteMenuEntry = (result:any, index:number) => (
        <div
          style={{
          margin: 0,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
        }}>
          <div style={{width: "100%", backgroundColor: isSubmenuVisible!==result?'white':'grey',}} 
               onMouseOver={() => {
                setSearchQuery(result);
                setFocusedSearchResultIndex(-1);
                setResults(sentenceSearch(result));
                setIsSubmenuVisible(result);}}>
             {result}
           </div >
           
          {userSearchResultSubMenu(result)}
        </div>
      );


      return menu(searchInput,
                 isUserSearchAutocompleteMenuHidden,
                 getUserSearchAutocompleteResults,
                 buildUserSearchAutocompleteMenuEntry,
                 buildAutocompleteResultsMenuWith);
      }
    
  const indexSearchAutocompleteMenu = (searchInput: string) => {
      const isIndexSearchAutocompleteMenuHidden = (searchInput: string) => {
        return indexAutocompleteResults.length === 0
      }

      const getIndexSearchAutocompleteResults = () => {
        return indexAutocompleteResults;
      }

      const buildIndexSearchAutocompleteMenuEntry = (result:any, index:number) => (
          <div style={{
               margin: 0,
               cursor: 'pointer',
               position: 'relative',
               display: 'flex',}}>
              <div style={{width: "100%", backgroundColor: isSubmenuVisibleIndex!==result?'white':'grey',}} 
                   onMouseOver={() => {
                     setIndexSearchQuery(result);
                     setFocusedIndexSearchResultIndex(-1);
                     setResultsIndex(search(result, rewritedSearchData.indexTrie));
                     setIsSubmenuVisibleIndex(result);}}>
                  {result}
              </div >
              {indexSearchResultSubMenu(result)}
          </div>
      );

      return menu(searchInput,
                 isIndexSearchAutocompleteMenuHidden,
                 getIndexSearchAutocompleteResults,
                 buildIndexSearchAutocompleteMenuEntry,
                 buildAutocompleteResultsMenuWith);
      }

  const buildAutocompleteResultsMenuWith = (children:React.ReactNode) => (
      <div style={{
           // how to make the menu scrollable only on y axis?
           height: '100px',
           position: 'absolute',
           backgroundColor: 'white',
           outline: 'dashed',
           width: '75%',}}>
             {children}
      </div>
    );

  const handleUserSearchButton = () => {
    setFocusedSearchResultIndex(-1);
    setResults(sentenceSearch(searchQuery));
    setIsSubmenuVisible(searchQuery);
  };

  const handleIndexSearchButton = () => {
    setFocusedIndexSearchResultIndex(-1);
    setResultsIndex(search(indexSearchQuery, rewritedSearchData.indexTrie));
    setIsSubmenuVisibleIndex(indexSearchQuery);
  }

  const userSearch = (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-flex' }}> 
          <InputGroup
            placeholder="Search"
            value={searchQuery}
            onChange={event => {
              const s = event.target.value;
              setSearchQuery(s);
              setSearchAutocompleteResults(sentenceAutoComplete(s));
            }}/>
          <ControlButton
            label="Text"
            icon={IconNames.SEARCH}
            onClick={handleUserSearchButton}/>
        </div>
        {userSearchAutocompleteMenu(searchQuery)}
      </div>
    );
  
  const indexSearch = (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-flex' }}>
          <InputGroup
            placeholder="Search"
            value={indexSearchQuery}
            onChange={event => {
              const s = event.target.value;
              setIndexSearchQuery(s);
              setIndexAutocompleteResults(autocomplete(s, rewritedSearchData.indexTrie));
            }}/>
          <ControlButton
            label="Index"
            icon={IconNames.SEARCH}
            onClick={handleIndexSearchButton}/>
        </div>
        {indexSearchAutocompleteMenu(indexSearchQuery)}
      </div>
    );
  
  const searchWrapper = (
    <div
      style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
      key="searchWrapper"
    >
      {[userSearch, indexSearch]}
    </div>
    );

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
    </>
  );
  }


export default SicpNavigationBar;
