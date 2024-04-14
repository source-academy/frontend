import { Chapter, Variant } from 'js-slang/dist/types';

export type ShareLinkState = {
  isFolder: boolean;
  files: Record<string, string>;
  tabs: string[];
  tabIdx: number | null;
  chap: Chapter;
  variant: Variant;
  exec: number;
};

export type ParsedIntermediateShareLinkState = {
  isFolder?: string;
  files?: string;
  tabs?: string[];
  tabIdx?: string;
  chap: string;
  variant: string;
  exec: string;
  prgrm?: string; // for backwards compatibility of old hash parameter shared links
};
