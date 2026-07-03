export type IndexSearchResult = {
  text: string;
  order: string;
  id: string;
  hasSubindex: boolean;
};

export type TrieNode = {
  children: Record<string, TrieNode>;
  value: string[] & IndexSearchResult[];
  key: string;
};

export type SearchData = {
  indexTrie: TrieNode;
  textTrie: TrieNode;
  idToContentMap: Record<string, string>;
};
