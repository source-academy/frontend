import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../../commons/application/ApplicationTypes';
import { mockGradingQuery } from '../../commons/mocks/GradingMocks';
import type { GradingQuery } from '../grading/GradingTypes';
import { gradingLibrary, useSelectGradingLanguage } from './gradingLanguage';
import LanguageDirectoryActions from './LanguageDirectoryActions';

const language = (id: string, evaluatorId: string) =>
  ({
    id,
    name: id,
    evaluators: [{ id: evaluatorId, name: evaluatorId }],
  }) as ILanguageDefinition;

// The language is the position in the directory: python4Typed is the fifth.
const languages = [
  language('python1', 'python1Py2js'),
  language('python2', 'python2Py2js'),
  language('python3', 'python3Py2js'),
  language('python4', 'python4Py2js'),
  language('python4Typed', 'python4TypedPy2js'),
  language('ocaml', 'ocamlJsOfOCaml'),
];

const withChapter = (chapter: number): GradingQuery =>
  ({
    ...mockGradingQuery,
    answers: mockGradingQuery.answers.map(answer => ({
      ...answer,
      question: {
        ...answer.question,
        library: { ...(answer.question as any).library, chapter },
      },
    })),
  }) as GradingQuery;

const withLibrary = (library: object): GradingQuery =>
  ({
    ...mockGradingQuery,
    answers: mockGradingQuery.answers.map(answer => ({
      ...answer,
      question: { ...answer.question, library },
    })),
  }) as GradingQuery;

function render(grading: GradingQuery | undefined) {
  const store = createMockStore<OverallState>()({
    languageDirectory: { languages, selectedLanguageId: 'python4' },
  } as unknown as OverallState);
  renderHook(() => useSelectGradingLanguage(grading), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return store.getActions();
}

describe('gradingLibrary', () => {
  test('is the library of the first programming question', () => {
    expect(gradingLibrary(withChapter(5))?.chapter).toBe(5);
  });

  test('is undefined without a grading', () => {
    expect(gradingLibrary(undefined)).toBeUndefined();
  });
});

describe('useSelectGradingLanguage', () => {
  test('selects the language of the submission shown (also a cached one)', () => {
    expect(render(withChapter(5))).toEqual([
      LanguageDirectoryActions.setSelectedLanguage('python4Typed'),
      LanguageDirectoryActions.setSelectedEvaluator('python4TypedPy2js'),
    ]);
  });

  test('a library that names its language and evaluator is not looked up by position', () => {
    expect(
      render(
        withLibrary({
          chapter: 1,
          language: 'ocaml',
          evaluator: 'ocamlJsOfOCaml',
        }),
      ),
    ).toEqual([
      LanguageDirectoryActions.setSelectedLanguage('ocaml'),
      LanguageDirectoryActions.setSelectedEvaluator('ocamlJsOfOCaml'),
    ]);
  });

  test('clears the selection for a chapter that is not in the directory', () => {
    expect(render(withChapter(50))).toEqual([LanguageDirectoryActions.clearSelectedLanguage()]);
  });

  test('leaves the selection alone without a grading', () => {
    expect(render(undefined)).toEqual([]);
  });
});
