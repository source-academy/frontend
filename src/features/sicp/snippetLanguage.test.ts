import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import { hashNamesLanguage, languageOfSnippetAt, textbookChapterOf } from './snippetLanguage';

const language = (id: string, route: string, chapters?: string[]) =>
  ({
    id,
    evaluators: [],
    textbook: { route, name: route, url: '', chapters },
  }) as unknown as ILanguageDefinition;
const languages = [
  language('python1', '/sicpy', ['1']),
  language('python2', '/sicpy', ['2']),
  language('python2Ext', '/sicpy'),
  language('source1', '/sicpjs', ['1']),
  language('source3', '/sicpjs', ['3']),
  { id: 'scheme', evaluators: [] } as unknown as ILanguageDefinition,
];

describe('textbookChapterOf', () => {
  test.each([
    ['/sicpjs/3.2', { route: '/sicpjs', chapter: '3' }],
    ['/sicpy/1.1.2', { route: '/sicpy', chapter: '1' }],
    ['/sicpjs/2', { route: '/sicpjs', chapter: '2' }],
    ['/sicpjs/12.1', { route: '/sicpjs', chapter: '12' }],
  ])('%s', (pathname, expected) => expect(textbookChapterOf(pathname)).toEqual(expected));

  test.each(['/sicpjs/index', '/sicpjs/foreword', '/sicpjs', '/playground', '/'])(
    '%s is not in a chapter',
    pathname => expect(textbookChapterOf(pathname)).toBeUndefined(),
  );
});

describe('languageOfSnippetAt', () => {
  test('is the language that the directory gives the chapter of the textbook', () => {
    expect(languageOfSnippetAt(languages, '/sicpjs/3.2')?.id).toBe('source3');
    expect(languageOfSnippetAt(languages, '/sicpy/2.1')?.id).toBe('python2');
  });

  test('a chapter of one textbook is not a chapter of the other', () => {
    expect(languageOfSnippetAt(languages, '/sicpy/3.1')).toBeUndefined();
    expect(languageOfSnippetAt(languages, '/sicpjs/2.1')).toBeUndefined();
  });

  test('is none for a page that is not a section, or before the directory is loaded', () => {
    expect(languageOfSnippetAt(languages, '/sicpjs/index')).toBeUndefined();
    expect(languageOfSnippetAt([], '/sicpjs/1.1')).toBeUndefined();
  });
});

describe('hashNamesLanguage', () => {
  test('a Conductor language, or a Source chapter, is a language', () => {
    expect(hashNamesLanguage('language=python&variant=2&prgrm=abc')).toBe(true);
    expect(hashNamesLanguage('chap=3&variant=default&prgrm=abc')).toBe(true);
  });

  test('a program alone, or a chapter that is not one of Source, is not', () => {
    expect(hashNamesLanguage('prgrm=abc')).toBe(false);
    expect(hashNamesLanguage('chap=0&prgrm=abc')).toBe(false);
    expect(hashNamesLanguage('chap=5&prgrm=abc')).toBe(false);
    expect(hashNamesLanguage('')).toBe(false);
  });
});
