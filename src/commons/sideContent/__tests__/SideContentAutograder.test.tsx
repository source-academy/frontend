import { render, screen } from '@testing-library/react';
import { ErrorSeverity, ErrorType, SourceError } from 'js-slang/dist/types';
import { act } from 'react';
import { shallowRender } from 'src/commons/utils/TestUtils';

import { AutogradingResult, Testcase, TestcaseTypes } from '../../assessment/AssessmentTypes';
import { mockGradingAnswer } from '../../mocks/GradingMocks';
import SideContentAutograder, {
  SideContentAutograderProps
} from '../content/SideContentAutograder';

const mockErrors: SourceError[] = [
  {
    type: ErrorType.RUNTIME,
    severity: ErrorSeverity.ERROR,
    location: { start: { line: 3, column: 11 }, end: { line: 3, column: 11 } },
    explain() {
      return `Name a not declared.`;
    },
    elaborate() {
      return `Name a not declared.`;
    }
  }
];

// The five testcases have statuses: correct, (none), correct, incorrect and error
const mockPublicTestcases: Testcase[] = [
  { program: `"string";`, score: 0, answer: `"string"`, result: `string` },
  { program: `fibonacci(2);`, score: 1, answer: `2` },
  { program: `fibonacci(3);`, score: 1, answer: `2`, result: 2 },
  { program: `fibonacci(4);`, score: 2, answer: `3`, result: 4 },
  { program: `fibonacci(5);`, score: 3, answer: `5`, errors: mockErrors }
].map(proto => {
  return { ...proto, type: TestcaseTypes.public };
});

const publicTestcaseCardClasses = [
  'AutograderCard correct',
  'AutograderCard',
  'AutograderCard correct',
  'AutograderCard wrong',
  'AutograderCard wrong'
];

// The four opaque testcases have statuses: (none), correct, incorrect and error
const mockOpaqueTestcases: Testcase[] = [
  { program: `add(3, 0);`, score: 1, answer: `3` },
  { program: `add(5, 2);`, score: 1, answer: `7`, result: 7 },
  { program: `add(-6, 6);`, score: 2, answer: `0`, result: 12 },
  { program: `add(-4, -7);`, score: 3, answer: `-11`, errors: mockErrors }
].map(proto => {
  return { ...proto, type: TestcaseTypes.opaque };
});

const opaqueTestcaseCardClasses = publicTestcaseCardClasses
  .slice(1)
  .map(classes => `${classes} secret`);

// The five testcases have statuses: correct, (none), correct, incorrect and error
const mockSecretTestcases: Testcase[] = [
  { program: `"lorem";`, score: 0, answer: `"lorem"`, result: `lorem` },
  { program: `is_prime(2);`, score: 1, answer: `true` },
  { program: `is_prime(3);`, score: 1, answer: `true`, result: true },
  { program: `is_prime(4);`, score: 2, answer: `false`, result: true },
  { program: `is_prime(5);`, score: 3, answer: `true`, errors: mockErrors }
].map(proto => {
  return { ...proto, type: TestcaseTypes.secret };
});

const secretTestcaseCardClasses = publicTestcaseCardClasses.map(classes => `${classes} secret`);

const mockAutogradingResults: AutogradingResult[] =
  mockGradingAnswer[0].question.autogradingResults;

const resultCardClasses = [
  'ResultCard correct',
  'ResultCard wrong',
  'ResultCard wrong',
  'ResultCard wrong',
  'ResultCard wrong'
];

test('Autograder renders placeholders correctly when testcases and results are empty', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: [],
    workspaceLocation: 'assessment',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // Both noResults <div>s are rendered (one under 'Testcases', other under 'Autograder Results')
  expect(screen.queryAllByTestId('noResults')).toHaveLength(2);

  // Both header <div>s should not be rendered
  expect(screen.queryAllByTestId('testcases-header')).toHaveLength(0);
  expect(screen.queryAllByTestId('results-header')).toHaveLength(0);

  // No testcase or autograder result Card components should be rendered
  expect(screen.queryAllByTestId('AutograderCard')).toHaveLength(0);
  expect(screen.queryAllByTestId('ResultCard')).toHaveLength(0);
});

test('Autograder renders public testcases with different statuses correctly', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockPublicTestcases,
    workspaceLocation: 'assessment',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // Expect only the header <div> for testcases section to be rendered
  expect(screen.queryAllByTestId('testcases-header')).toHaveLength(1);
  expect(screen.queryAllByTestId('results-header')).toHaveLength(0);

  // No autograder result Card components should be rendered
  expect(screen.queryAllByTestId('ResultCard')).toHaveLength(0);

  // Expect each of the five testcases to have:
  //    Correct result rendered in the 'Actual result' cell
  //    Correct CSS styling applied to each Card (by className)
  const cards = screen.getAllByTestId('AutograderCard');
  expect(cards).toHaveLength(5);
  expect(cards.map(card => card.className)).toEqual(publicTestcaseCardClasses);

  // textContent returns the value wrapped by the opening and closing tags of the
  // enclosing HTML node as a string: this means the
  //    === INTERPRETER RETURN TYPES ===
  //      number [2] will be returned as "2"
  //      string ["2"] will be returned as "\"2\""
  //      error message [Line 1: Error: 'Msg'] will be returned as "Line 1: Error \"Msg\""
  //    === OTHER TYPES ===
  //      default rendered ['No Answer'] will be returned as "No Answer"
  const resultCells = screen.getAllByTestId('testcase-actual');
  expect(resultCells.map(node => node.textContent)).toEqual([
    '"string"',
    'No Answer',
    '2',
    '4',
    'Line 3: Name a not declared.'
  ]);
});

test('Autograder renders opaque testcases with different statuses correctly in AssessmentWorkspace', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockOpaqueTestcases,
    workspaceLocation: 'assessment',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // No autograder result Card components should be rendered
  expect(screen.queryAllByTestId('ResultCard')).toHaveLength(0);

  // Expect each of the four testcases to have:
  //    A placeholder cell rendered in place of the actual testcase data
  //    Correct CSS styling applied to each Card (by className)
  const cards = screen.getAllByTestId('AutograderCard');
  const placeholders = screen.getAllByTestId('testcase-placeholder');
  expect(cards).toHaveLength(4);
  expect(placeholders).toHaveLength(4);
  expect(cards.map(node => node.className)).toEqual(opaqueTestcaseCardClasses);
  placeholders.forEach(p => {
    expect(p.textContent).toEqual('Hidden testcase');
  });
});

test('Autograder renders opaque testcases with different statuses correctly in GradingWorkspace', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockOpaqueTestcases,
    workspaceLocation: 'grading',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // No autograder result Card components should be rendered
  expect(screen.queryAllByTestId('ResultCard')).toHaveLength(0);

  // Expect each of the four testcases to have:
  //    A placeholder cell rendered in place of the actual testcase data
  //    Correct CSS styling applied to each Card (by className)
  const cards = screen.getAllByTestId('AutograderCard');
  expect(cards).toHaveLength(4);
  expect(cards.map(node => node.className)).toEqual(opaqueTestcaseCardClasses);
  const resultCells = screen.getAllByTestId('testcase-actual');
  expect(resultCells.map(node => node.textContent)).toEqual([
    'No Answer',
    '7',
    '12',
    'Line 3: Name a not declared.'
  ]);
});

test('Autograder renders secret testcases with different statuses correctly', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockSecretTestcases,
    workspaceLocation: 'grading',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // Expect only the header <div> for testcases section to be rendered
  expect(screen.queryAllByTestId('testcases-header')).toHaveLength(1);
  expect(screen.queryAllByTestId('results-header')).toHaveLength(0);

  // No autograder result Card components should be rendered
  expect(screen.queryAllByTestId('ResultCard')).toHaveLength(0);

  // Expect each of the five testcases to have:
  //    Correct result rendered in the 'Actual result' cell
  //    Correct CSS styling applied to each Card (by className)
  const cards = screen.getAllByTestId('AutograderCard');
  expect(cards).toHaveLength(5);
  expect(cards.map(node => node.className)).toEqual(secretTestcaseCardClasses);
  const resultCells = screen.getAllByTestId('testcase-actual');

  // textContent returns the value wrapped by the opening and closing tags of the
  // enclosing HTML node as a string
  expect(resultCells.map(node => node.textContent)).toEqual([
    '"lorem"',
    'No Answer',
    'true',
    'true',
    'Line 3: Name a not declared.'
  ]);
});

test('Autograder renders autograder results with different statuses correctly', async () => {
  const props: SideContentAutograderProps = {
    autogradingResults: mockAutogradingResults,
    testcases: [],
    workspaceLocation: 'assessment',
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));

  // Expect only the header <div> for autograder results section to be rendered
  expect(screen.queryAllByTestId('testcases-header')).toHaveLength(0);
  expect(screen.queryAllByTestId('results-header')).toHaveLength(1);

  // No testcase Card components should be rendered
  expect(screen.queryAllByTestId('AutograderCard')).toHaveLength(0);

  // Expect each of the three autograder results to have:
  //    Correct data rendered in the 'Testcase status', 'Expected result' and 'Actual result' cells
  //    Correct CSS styling applied to each Card
  const cards = screen.getAllByTestId('ResultCard');
  expect(cards).toHaveLength(5);
  expect(cards.map(node => node.className)).toEqual(resultCardClasses);

  // Extract the text contained within the cells: see above comment for textContent
  const resultIdxs = screen.getAllByTestId('result-idx');
  const resultStatuses = screen.getAllByTestId('result-status');
  const resultExpecteds = screen.getAllByTestId('result-expected');
  const resultActuals = screen.getAllByTestId('result-actual');

  [resultIdxs, resultStatuses, resultExpecteds, resultActuals].forEach(e => {
    expect(e).toHaveLength(5);
  });

  const resultCellsValues = resultIdxs
    .map((e, idx) => [e, resultStatuses[idx], resultExpecteds[idx], resultActuals[idx]])
    .map(set => set.map(value => value.textContent));

  expect(resultCellsValues).toEqual([
    ['1', 'PASS', '', ''],
    ['2', 'FAIL', '8', '5'],
    ['3', 'ERROR', '', '[UNKNOWN] Autograder error: type dummyErrorType'],
    ['4', 'ERROR', '', "[SYSTEM] Cannot read property 'getUniformLocation' of null"],
    [
      '5',
      'ERROR',
      '',
      '[TIMEOUT] Submission exceeded time limit for this test case.\n\n' +
        '[SYNTAX] Line 2: Missing semicolon at the end of statement'
    ]
  ]);
});
