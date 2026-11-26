import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import {
  isTextbookPath,
  textbookHighlightLanguage,
  textbookLanguageAt,
  textbookRoutes,
} from './textbooks';

const language = (id: string, route?: string, aceMode?: unknown) =>
  ({
    id,
    evaluators: [],
    ...(route ? { textbook: { route, name: route, url: '' } } : {}),
    ...(aceMode === undefined ? {} : { editorConfig: { aceMode } }),
  }) as unknown as ILanguageDefinition;

const languages = [
  language('a1', '/book-a', 'ace/mode/alpha'),
  language('a2', '/book-a', 'ace/mode/alpha'),
  language('b1', '/book-b', 'beta'),
  language('c1', '/book-c'),
  language('none'),
];

describe('textbookRoutes', () => {
  test('are the routes of the textbooks of the directory, each once, in its order', () => {
    expect(textbookRoutes(languages)).toEqual(['/book-a', '/book-b', '/book-c']);
  });

  test('are none before the directory is loaded', () => {
    expect(textbookRoutes([])).toEqual([]);
  });
});

describe('isTextbookPath', () => {
  test.each(['/book-a', '/book-a/3.2', '/book-b/index'])('%s is a page of a textbook', pathname => {
    expect(isTextbookPath(languages, pathname)).toBe(true);
  });

  test.each(['/playground', '/book-ab', '/book-a-and-more/1', '/', '/courses/1/book-a'])(
    '%s is not',
    pathname => {
      expect(isTextbookPath(languages, pathname)).toBe(false);
    },
  );

  test('nothing is, before the directory is loaded', () => {
    expect(isTextbookPath([], '/book-a/1')).toBe(false);
  });
});

describe('textbookLanguageAt', () => {
  test('is the first language of the directory that the textbook is in', () => {
    expect(textbookLanguageAt(languages, '/book-a')?.id).toBe('a1');
    expect(textbookLanguageAt(languages, '/book-b')?.id).toBe('b1');
  });

  test('is none for a route that is no textbook', () => {
    expect(textbookLanguageAt(languages, '/book-z')).toBeUndefined();
  });
});

describe('textbookHighlightLanguage', () => {
  test('is the Ace mode of the language of the textbook, with or without its prefix', () => {
    expect(textbookHighlightLanguage(languages, '/book-a')).toBe('alpha');
    expect(textbookHighlightLanguage(languages, '/book-b')).toBe('beta');
  });

  test('is none for a language without an Ace mode, a route without a textbook, or no directory', () => {
    expect(textbookHighlightLanguage(languages, '/book-c')).toBeUndefined();
    expect(textbookHighlightLanguage(languages, '/book-z')).toBeUndefined();
    expect(textbookHighlightLanguage([], '/book-a')).toBeUndefined();
    expect(textbookHighlightLanguage([language('x', '/book-x', 42)], '/book-x')).toBeUndefined();
  });
});
