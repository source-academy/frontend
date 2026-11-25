import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import { resolveLibraryLanguage } from './libraryLanguage';

const language = (id: string, ...evaluators: string[]) =>
  ({
    id,
    name: id,
    evaluators: evaluators.map(e => ({ id: e, name: e })),
  }) as ILanguageDefinition;

const languages = [
  language('python1', 'python1Py2js'),
  language('python4', 'python4Py2js', 'python4EStepper'),
  language('ocaml', 'ocamlJsOfOCaml'),
];

describe('resolveLibraryLanguage', () => {
  test('a library names its language and evaluator by id', () => {
    expect(
      resolveLibraryLanguage(languages, {
        chapter: 1,
        language: 'python4',
        evaluator: 'python4EStepper',
      }),
    ).toEqual({ languageId: 'python4', evaluatorId: 'python4EStepper' });
  });

  test('the ids win over the chapter, which is only a position', () => {
    expect(
      resolveLibraryLanguage(languages, {
        chapter: 1,
        language: 'ocaml',
        evaluator: 'ocamlJsOfOCaml',
      }),
    ).toEqual({ languageId: 'ocaml', evaluatorId: 'ocamlJsOfOCaml' });
  });

  test('a language without an evaluator means its first evaluator', () => {
    expect(resolveLibraryLanguage(languages, { chapter: 1, language: 'python4' })).toEqual({
      languageId: 'python4',
      evaluatorId: 'python4Py2js',
    });
  });

  test('a name that the directory does not know is not guessed', () => {
    expect(resolveLibraryLanguage(languages, { chapter: 1, language: 'haskell' })).toBeUndefined();
    expect(
      resolveLibraryLanguage(languages, {
        chapter: 1,
        language: 'python4',
        evaluator: 'nope',
      }),
    ).toBeUndefined();
  });

  test('a library without a language has its chapter, a position in the directory', () => {
    expect(resolveLibraryLanguage(languages, { chapter: 3 })).toEqual({
      languageId: 'ocaml',
      evaluatorId: 'ocamlJsOfOCaml',
    });
    expect(resolveLibraryLanguage(languages, { chapter: 50 })).toBeUndefined();
  });

  test('no library, no language', () => {
    expect(resolveLibraryLanguage(languages, undefined)).toBeUndefined();
  });
});
