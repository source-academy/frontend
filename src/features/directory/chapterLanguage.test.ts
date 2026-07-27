import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import { deriveLanguageFromChapter } from './chapterLanguage';

function makeLanguage(id: string, evaluatorIds: string[]): ILanguageDefinition {
  return {
    id,
    name: id,
    evaluators: evaluatorIds.map(evaluatorId => ({
      id: evaluatorId,
      name: evaluatorId,
      path: `https://example.com/${evaluatorId}.js`,
      capabilities: [],
    })),
  };
}

const languages: ILanguageDefinition[] = [
  makeLanguage('python1', ['python1Py2js', 'python1Pvml', 'python1Cse']),
  makeLanguage('python2', ['python2Py2js', 'python2Pvml', 'python2Cse']),
  makeLanguage('python3', ['python3Py2js', 'python3Pvml', 'python3Cse']),
  makeLanguage('python4', ['python4Py2js', 'python4Pvml', 'python4Cse']),
  makeLanguage('pythonFull', ['pythonFullPyodide']),
  makeLanguage('scheme', ['schemeDefault']),
];

describe('deriveLanguageFromChapter', () => {
  test('maps chapter 1-4 to python1-python4, always picking the Py2js evaluator', () => {
    expect(deriveLanguageFromChapter(languages, 1)).toEqual({
      languageId: 'python1',
      evaluatorId: 'python1Py2js',
    });
    expect(deriveLanguageFromChapter(languages, 2)).toEqual({
      languageId: 'python2',
      evaluatorId: 'python2Py2js',
    });
    expect(deriveLanguageFromChapter(languages, 3)).toEqual({
      languageId: 'python3',
      evaluatorId: 'python3Py2js',
    });
    expect(deriveLanguageFromChapter(languages, 4)).toEqual({
      languageId: 'python4',
      evaluatorId: 'python4Py2js',
    });
  });

  test('falls back to the only evaluator when a language has no Py2js option', () => {
    expect(deriveLanguageFromChapter(languages, 5)).toEqual({
      languageId: 'pythonFull',
      evaluatorId: 'pythonFullPyodide',
    });
    expect(deriveLanguageFromChapter(languages, 6)).toEqual({
      languageId: 'scheme',
      evaluatorId: 'schemeDefault',
    });
  });

  test('returns undefined for an out-of-range chapter', () => {
    expect(deriveLanguageFromChapter(languages, 0)).toBeUndefined();
    expect(deriveLanguageFromChapter(languages, 7)).toBeUndefined();
  });

  test('returns undefined when chapter is undefined', () => {
    expect(deriveLanguageFromChapter(languages, undefined)).toBeUndefined();
  });

  test('returns undefined when the languages array is empty', () => {
    expect(deriveLanguageFromChapter([], 1)).toBeUndefined();
  });
});
