import { describe, expect, test } from 'vitest';

import { type Assessment, emptyLibrary, type Library } from '../assessment/AssessmentTypes';
import { assessmentToXml } from './XMLParserHelper';

const overview = { type: 'Missions', title: 'm', shortSummary: '' } as any;

const named = (chapter: number, language?: string, evaluator?: string): Library => ({
  ...emptyLibrary(),
  chapter,
  language,
  evaluator,
});

const assessmentWith = (libraries: {
  frontendGraderDeployment?: Library;
  graderDeployment?: Library;
  questionLibrary?: Library;
  frontendGradingLibrary?: Library;
}): Assessment =>
  ({
    longSummary: '',
    globalDeployment: emptyLibrary(),
    frontendGraderDeployment: libraries.frontendGraderDeployment,
    graderDeployment: libraries.graderDeployment ?? emptyLibrary(),
    questions: [
      {
        type: 'programming',
        answer: '',
        content: '',
        library: libraries.questionLibrary ?? emptyLibrary(),
        frontendGradingLibrary: libraries.frontendGradingLibrary,
        graderLibrary: emptyLibrary(),
        testcases: [],
        testcasesPrivate: [],
      },
    ],
  }) as unknown as Assessment;

describe('assessmentToXml', () => {
  test('exports a library that names a language, although its chapter is -1', () => {
    const ocaml = named(-1, 'ocaml', 'ocamlJsOfOCaml');
    const task: any = assessmentToXml(
      assessmentWith({
        frontendGraderDeployment: ocaml,
        graderDeployment: ocaml,
        questionLibrary: ocaml,
        frontendGradingLibrary: ocaml,
      }),
      overview,
    );
    const attributes = { interpreter: '-1', language: 'ocaml', evaluator: 'ocamlJsOfOCaml' };

    expect(task.FRONTEND_GRADER_PROGRAMMING_LANGUAGE.$).toEqual(attributes);
    expect(task.BACKEND_GRADER_PROGRAMMING_LANGUAGE.$).toEqual(attributes);
    const problem = task.PROBLEMS.PROBLEM[0];
    expect(problem.USER_PROGRAMMING_LANGUAGE.$).toEqual(attributes);
    expect(problem.FRONTEND_GRADER_PROGRAMMING_LANGUAGE.$).toEqual(attributes);
  });

  test('exports a library that has only a chapter', () => {
    const task: any = assessmentToXml(
      assessmentWith({ frontendGraderDeployment: named(4), questionLibrary: named(2) }),
      overview,
    );
    expect(task.FRONTEND_GRADER_PROGRAMMING_LANGUAGE.$).toEqual({ interpreter: '4' });
    expect(task.PROBLEMS.PROBLEM[0].USER_PROGRAMMING_LANGUAGE.$).toEqual({ interpreter: '2' });
  });

  test('leaves out a library that says nothing', () => {
    const task: any = assessmentToXml(
      assessmentWith({ frontendGraderDeployment: emptyLibrary() }),
      overview,
    );
    expect(task.FRONTEND_GRADER_PROGRAMMING_LANGUAGE).toBeUndefined();
    expect(task.BACKEND_GRADER_PROGRAMMING_LANGUAGE).toBeUndefined();
    const problem = task.PROBLEMS.PROBLEM[0];
    expect(problem.USER_PROGRAMMING_LANGUAGE).toBeUndefined();
    expect(problem.FRONTEND_GRADER_PROGRAMMING_LANGUAGE).toBeUndefined();
  });
});
