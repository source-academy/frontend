import Constants from 'src/commons/utils/Constants';

import type { SearchData, TrieNode } from './types';

const emptyTrieNode: TrieNode = { children: {}, value: [] as any, key: '' };

export const emptySearchData: SearchData = {
  indexTrie: emptyTrieNode,
  textTrie: emptyTrieNode,
  idToContentMap: {},
};

export async function fetchSicpSearchData() {
  if (process.env.NODE_ENV === 'test') {
    return emptySearchData;
  }

  const resp = await fetch(Constants.sicpBackendUrl + 'json/searchData.json');
  if (!resp.ok) {
    throw new Error('Unable to get search data. Error code = ' + resp.status);
  }
  const searchData: SearchData = await resp.json();
  return searchData;
}

export async function fetchSicpySearchData() {
  if (process.env.NODE_ENV === 'test') {
    return emptySearchData;
  }

  const url = Constants.sicpBackendUrl + 'json_py/searchData.json';
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Unable to get search data. Error code = ${resp.status} url is ${url}`);
  }
  const searchData: SearchData = await resp.json();
  return searchData;
}
