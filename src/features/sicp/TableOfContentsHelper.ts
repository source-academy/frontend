import tocNavigation from './data/toc-navigation.json';

export const getNext = (section: string): string | undefined => {
  const node = tocNavigation[section];

  return node && node['next'];
};

export const getPrev = (section: string): string | undefined => {
  const node = tocNavigation[section];

  return node && node['prev'];
};
