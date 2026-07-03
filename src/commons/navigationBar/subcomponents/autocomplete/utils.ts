import type { SearchData, TrieNode } from './types';

function autocomplete(prefix: string, trie: TrieNode, n: number = 25): string[] {
  let node = trie;
  for (const ch of prefix) {
    if (!node.children[ch]) {
      return [];
    }
    node = node.children[ch];
  }
  const result: string[] = [];
  const queue: TrieNode[] = [node];
  while (queue.length > 0 && result.length < n) {
    const currNode = queue.shift()!;
    if (currNode.value.length > 0) {
      result.push(currNode.key);
    }
    for (const child of Object.values(currNode.children)) {
      queue.push(child);
    }
  }
  return result;
}

export function search(keyStr: string, trie: TrieNode) {
  let node = trie;
  for (const ch of keyStr) {
    if (!node?.children?.[ch]) {
      return [];
    }
    node = node.children[ch];
  }
  return node.value || [];
}

export function sentenceSearch(rewritedSearchData: SearchData, keyStr: string): string[] {
  const normalizedKey = keyStr.toLowerCase();
  const words = normalizedKey.split(' ');
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');
  return search(longestWord, rewritedSearchData.textTrie).filter(id => {
    const content = rewritedSearchData.idToContentMap[id].toLowerCase().replaceAll('\n', ' ');
    return content.includes(normalizedKey);
  });
}

export function sentenceAutoComplete(
  rewritedSearchData: SearchData,
  prefix: string,
  n: number = 25,
): string[] {
  const normalizedPrefix = prefix.toLowerCase();
  const words = normalizedPrefix.split(' ');
  if (words.length === 0) {
    return [];
  }
  if (words.length === 1) {
    return autocomplete(words[0], rewritedSearchData.textTrie, n);
  }
  const pre = words.slice(0, -1).join(' ');
  const results: string[] = sentenceSearch(rewritedSearchData, pre)
    .map(id => rewritedSearchData.idToContentMap[id]?.toLowerCase())
    .filter(text => !!text);
  const answers: string[] = [];
  while (answers.length < n && results.length > 0) {
    let sentence = results.shift();
    if (!sentence) {
      continue;
    }
    sentence = sentence.replaceAll('\n', ' ');
    const start = sentence.indexOf(normalizedPrefix) + normalizedPrefix.length;
    if (start >= normalizedPrefix.length) {
      const rest = sentence.slice(start);
      let end = rest.search(/[^a-zA-Z _]/);
      if (end === -1) {
        end = rest.length;
      }
      const toPush = (normalizedPrefix + rest.slice(0, end)).trim();
      if (!answers.includes(toPush)) {
        answers.push(toPush);
      }
    }
  }
  return answers;
}

export function indexAutoComplete(
  rewritedSearchData: SearchData,
  prefix: string,
  n: number = 25,
): string[] {
  if (!prefix) {
    return [];
  }
  const lower = prefix[0].toLowerCase() + prefix.slice(1);
  const upper = prefix[0].toUpperCase() + prefix.slice(1);
  const result1 = autocomplete(lower, rewritedSearchData.indexTrie, n);
  const result2 = autocomplete(upper, rewritedSearchData.indexTrie, n);
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
