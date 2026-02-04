import { DistributedKeyOf, Merge } from 'src/commons/utils/TypeHelper';

import tocNavigation from './data/toc-navigation.json';

type MergeAll<T extends Record<any, Record<any, any>>> = {
  [K in keyof T]: Merge<T[K], Record<DistributedKeyOf<T[keyof T]>, undefined>>;
};

type NodeTree = MergeAll<typeof tocNavigation>;
type Node = NodeTree[keyof NodeTree];

export const getNext = (section: string): string | undefined => {
  const node = tocNavigation[section as keyof typeof tocNavigation] as Node;
  return node && node.next;
};

export const getPrev = (section: string): string | undefined => {
  const node = tocNavigation[section as keyof typeof tocNavigation] as Node;
  return node && node.prev;
};
