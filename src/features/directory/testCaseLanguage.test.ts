import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../../commons/application/ApplicationTypes';
import {
  selectTestCaseLanguage,
  TEST_CASE_EVALUATOR_ID,
  TEST_CASE_LANGUAGE_ID,
  testCaseLanguageFor,
} from './testCaseLanguage';

describe('testCaseLanguageFor', () => {
  test('Python §4 Typed grades under its typed evaluator, so that type errors count', () => {
    expect(testCaseLanguageFor('python4Typed')).toEqual({
      languageId: 'python4Typed',
      evaluatorId: 'python4TypedPy2js',
    });
  });

  test.each(['python1', 'python3', 'python4', 'pythonFull', 'source1', null, undefined])(
    'everything else grades under Python §4 (%s)',
    selected => {
      expect(testCaseLanguageFor(selected)).toEqual({
        languageId: TEST_CASE_LANGUAGE_ID,
        evaluatorId: TEST_CASE_EVALUATOR_ID,
      });
    },
  );
});

describe('selectTestCaseLanguage', () => {
  const language = (id: string) =>
    ({ id, name: id, evaluators: [{ id: `${id}Py2js` }] }) as ILanguageDefinition;
  // The language is the position in the directory: python4Typed is the fifth.
  const languages = ['python1', 'python2', 'python3', 'python4', 'python4Typed'].map(language);
  const ocaml = {
    id: 'ocaml',
    name: 'OCaml',
    evaluators: [{ id: 'ocamlJsOfOCaml' }],
  } as ILanguageDefinition;
  languages.push(ocaml);
  const untyped = { languageId: TEST_CASE_LANGUAGE_ID, evaluatorId: TEST_CASE_EVALUATOR_ID };
  const typed = { languageId: 'python4Typed', evaluatorId: 'python4TypedPy2js' };

  const state = (overrides: object, selectedLanguageId: string | null = null) =>
    ({
      languageDirectory: { languages, selectedLanguageId },
      session: { gradings: {}, assessments: {} },
      workspaces: {
        grading: { currentSubmission: undefined, currentQuestion: undefined },
        assessment: { currentAssessment: undefined, currentQuestion: undefined },
      },
      ...overrides,
    }) as unknown as OverallState;

  const withChapter = (chapter: number) => ({ library: { chapter } });

  test('a typed assessment runs typed, whatever the global selection is', () => {
    const s = state(
      {
        session: { gradings: {}, assessments: { 3: { questions: [withChapter(5)] } } },
        workspaces: {
          grading: {},
          assessment: { currentAssessment: 3, currentQuestion: 0 },
        },
      },
      'python4',
    );
    expect(selectTestCaseLanguage(s, 'assessment')).toEqual(typed);
  });

  test('an untyped assessment runs under Python §4, although a typed language is selected', () => {
    const s = state(
      {
        session: { gradings: {}, assessments: { 3: { questions: [withChapter(2)] } } },
        workspaces: {
          grading: {},
          assessment: { currentAssessment: 3, currentQuestion: 0 },
        },
      },
      'python4Typed',
    );
    expect(selectTestCaseLanguage(s, 'assessment')).toEqual(untyped);
  });

  test('a graded submission is judged by its own question', () => {
    const s = state(
      {
        session: {
          gradings: {
            9: { answers: [{ question: withChapter(1) }, { question: withChapter(5) }] },
          },
          assessments: {},
        },
        workspaces: {
          grading: { currentSubmission: 9, currentQuestion: 1 },
          assessment: {},
        },
      },
      'python4',
    );
    expect(selectTestCaseLanguage(s, 'grading')).toEqual(typed);
  });

  test('falls back to the selection when the question is not known', () => {
    expect(selectTestCaseLanguage(state({}, 'python4Typed'), 'assessment')).toEqual(typed);
    expect(selectTestCaseLanguage(state({}, 'python4'), 'grading')).toEqual(untyped);
    expect(selectTestCaseLanguage(state({}, null), 'playground')).toEqual(untyped);
  });

  describe('a question that names its languages and evaluators (backend#1387)', () => {
    const assessmentWith = (question: object) =>
      state({
        session: {
          gradings: {},
          assessments: { 3: { questions: [question] } },
        },
        workspaces: {
          grading: {},
          assessment: { currentAssessment: 3, currentQuestion: 0 },
        },
      });
    const ocamlJs = { languageId: 'ocaml', evaluatorId: 'ocamlJsOfOCaml' };
    const named = (language: string, evaluator?: string) => ({
      chapter: 1,
      language,
      evaluator,
    });

    test('the frontend grader library decides, whatever the user library is', () => {
      const s = assessmentWith({
        library: named('python2', 'python2Py2js'),
        frontendGradingLibrary: named('python4Typed', 'python4TypedPy2js'),
      });
      expect(selectTestCaseLanguage(s, 'assessment')).toEqual(typed);
    });

    test('an OCaml question runs its test cases under OCaml, not Python', () => {
      const s = assessmentWith({
        library: named('ocaml', 'ocamlJsOfOCaml'),
        frontendGradingLibrary: named('ocaml', 'ocamlJsOfOCaml'),
      });
      expect(selectTestCaseLanguage(s, 'assessment')).toEqual(ocamlJs);
    });

    test('without a frontend grader library, the library that names a language is the grader', () => {
      const s = assessmentWith({ library: named('ocaml') });
      expect(selectTestCaseLanguage(s, 'assessment')).toEqual(ocamlJs);
    });

    test('a language that the directory does not have is not replaced by Python', () => {
      const s = assessmentWith({
        library: named('ocaml'),
        frontendGradingLibrary: named('haskell', 'haskellGhcjs'),
      });
      expect(selectTestCaseLanguage(s, 'assessment')).toBeUndefined();
    });
  });
});
