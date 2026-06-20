import type { DistributedKeyOf, Merge } from 'src/commons/utils/TypeHelper';

import tocNavigation from './data/toc-navigation-py.json';

type MergeAll<T extends Record<any, Record<any, any>>> = {
  [K in keyof T]: Merge<T[K], Record<DistributedKeyOf<T[keyof T]>, undefined>>;
};

type NodeTree = MergeAll<typeof tocNavigation>;
type Node = NodeTree[keyof NodeTree];

export const getNextPy = (section: string): string | undefined => {
  const node = tocNavigation[section as keyof typeof tocNavigation] as Node;
  return node && node.next;
};

export const getPrevPy = (section: string): string | undefined => {
  const node = tocNavigation[section as keyof typeof tocNavigation] as Node;
  return node && node.prev;
};
