import type { SearchData, TrieNode } from './types';

function autocomplete(prefix: string, trie: TrieNode, n: number = 25): string[] {
  let node = trie;
  for (const ch of prefix) {
    if (!node.children[ch]) return [];
    node = node.children[ch];
  }
  const result: string[] = [];
  const queue: TrieNode[] = [node];
  while (queue.length > 0 && result.length < n) {
    const currNode = queue.shift()!;
    if (currNode.value.length > 0) result.push(currNode.key);
    for (const child of Object.values(currNode.children)) {
      queue.push(child);
    }
  }
  return result;
}

export function search(keyStr: string, trie: TrieNode) {
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

export function sentenceSearch(rewritedSearchData: SearchData, keyStr: string) {
  const words = keyStr.split(' ');
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');
  const results = search(longestWord, rewritedSearchData.textTrie).filter(id => {
    const text = rewritedSearchData.idToContentMap[id].toLowerCase().replaceAll('\n', ' ');
    return text.includes(keyStr);
  });
  return results;
}

export function sentenceAutoComplete(
  rewritedSearchData: SearchData,
  incompleteKeys: string,
  n: number = 25,
) {
  const words = incompleteKeys.split(' ');
  if (words.length === 0) {
    return [];
  }
  if (words.length === 1) {
    return autocomplete(words[0], rewritedSearchData.textTrie, n);
  }
  const pre = words.slice(0, -1).join(' ');
  const results = sentenceSearch(rewritedSearchData, pre).map(id =>
    rewritedSearchData.idToContentMap[id].toLowerCase(),
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

export function indexAutoComplete(
  rewritedSearchData: SearchData,
  incompleteKeys: string,
  n: number = 25,
) {
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
