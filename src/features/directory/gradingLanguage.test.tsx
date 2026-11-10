import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../../commons/application/ApplicationTypes';
import { mockGradingQuery } from '../../commons/mocks/GradingMocks';
import type { GradingQuery } from '../grading/GradingTypes';
import { gradingChapter, useSelectGradingLanguage } from './gradingLanguage';
import LanguageDirectoryActions from './LanguageDirectoryActions';

const language = (id: string, evaluatorId: string) =>
  ({ id, name: id, evaluators: [{ id: evaluatorId, name: evaluatorId }] }) as ILanguageDefinition;

// The language is the position in the directory: python4Typed is the fifth.
const languages = [
  language('python1', 'python1Py2js'),
  language('python2', 'python2Py2js'),
  language('python3', 'python3Py2js'),
  language('python4', 'python4Py2js'),
  language('python4Typed', 'python4TypedPy2js'),
];

const withChapter = (chapter: number): GradingQuery =>
  ({
    ...mockGradingQuery,
    answers: mockGradingQuery.answers.map(answer => ({
      ...answer,
      question: { ...answer.question, library: { ...(answer.question as any).library, chapter } },
    })),
  }) as GradingQuery;

function render(grading: GradingQuery | undefined, conductor = true) {
  const store = createMockStore<OverallState>()({
    featureFlags: { modifiedFlags: { 'conductor.enable': conductor } },
    languageDirectory: { languages, selectedLanguageId: 'python4' },
  } as unknown as OverallState);
  renderHook(() => useSelectGradingLanguage(grading), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return store.getActions();
}

describe('gradingChapter', () => {
  test('is the chapter of the first programming question', () => {
    expect(gradingChapter(withChapter(5))).toBe(5);
  });

  test('is undefined without a grading', () => {
    expect(gradingChapter(undefined)).toBeUndefined();
  });
});

describe('useSelectGradingLanguage', () => {
  test('selects the language of the submission shown (also a cached one)', () => {
    expect(render(withChapter(5))).toEqual([
      LanguageDirectoryActions.setSelectedLanguage('python4Typed'),
      LanguageDirectoryActions.setSelectedEvaluator('python4TypedPy2js'),
    ]);
  });

  test('clears the selection for a chapter that is not in the directory', () => {
    expect(render(withChapter(50))).toEqual([LanguageDirectoryActions.clearSelectedLanguage()]);
  });

  test('leaves the selection alone without Conductor, and without a grading', () => {
    expect(render(withChapter(5), false)).toEqual([]);
    expect(render(undefined)).toEqual([]);
  });
});
