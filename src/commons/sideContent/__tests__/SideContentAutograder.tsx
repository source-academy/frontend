import { mount, shallow } from 'enzyme';
import { ErrorSeverity, ErrorType, SourceError } from 'js-slang/dist/types';
import * as React from 'react';

import { AutogradingResult, Testcase, TestcaseTypes } from '../../assessment/AssessmentTypes';
import SideContentAutograder, { SideContentAutograderProps } from '../SideContentAutograder';

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

// The four hidden testcases have statuses: (none), correct, incorrect and error
const mockHiddenTestcases: Testcase[] = [
  { program: `add(3, 0);`, score: 1, answer: `3` },
  { program: `add(5, 2);`, score: 1, answer: `7`, result: 7 },
  { program: `add(-6, 6);`, score: 2, answer: `0`, result: 12 },
  { program: `add(-4, -7);`, score: 3, answer: `-11`, errors: mockErrors }
].map(proto => {
  return { ...proto, type: TestcaseTypes.hidden };
});

const hiddenTestcaseCardClasses = publicTestcaseCardClasses.slice(1);

const mockAutogradingResults: AutogradingResult[] = [
  { resultType: 'pass' },
  { resultType: 'fail', expected: '8', actual: '5' },
  {
    resultType: 'error',
    errors: [
      { errorType: 'timeout' },
      {
        errorType: 'syntax',
        line: 1,
        location: 'student',
        errorLine: 'function fibonacci(n) {',
        errorExplanation: 'Just kidding!'
      }
    ]
  }
];

const resultCardClasses = ['ResultCard correct', 'ResultCard wrong', 'ResultCard wrong'];

/*  ===== Tester comments =====
    Issue:
      https://github.com/airbnb/enzyme/issues/836 
    Description:
      tree.find(<HTML Selector>) returns two copies of every non-top-level element, as Enzyme
      returns both React component instances in addition to DOM nodes. This is INTENDED behaviour.
      For example, the <div> with id of '.testcase-actual' is returned twice since one of them
      is a React Component, whilst the other is the actual HTML <div> node that Component renders
    Fix:
      Append .hostNodes() when desired to only retrieve the HTML DOM nodes from the rendered tree.
*/

test('Autograder renders placeholders correctly when testcases and results are empty', () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: [],
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  // Both noResults <div>s are rendered (one under 'Testcases', other under 'Autograder Results')
  expect(tree.find('.noResults').hostNodes()).toHaveLength(2);
  // Both header <div>s should not be rendered
  expect(tree.find('.testcases-header').hostNodes().exists()).toEqual(false);
  expect(tree.find('.results-header').hostNodes().exists()).toEqual(false);
  // No testcase or autograder result Card components should be rendered
  expect(tree.find('.AutograderCard')).toHaveLength(0);
  expect(tree.find('.ResultCard')).toHaveLength(0);
});

test('Autograder renders public testcases with different statuses correctly', () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockPublicTestcases,
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect only the header <div> for testcases section to be rendered
  expect(tree.find('.testcases-header').hostNodes().exists()).toEqual(true);
  expect(tree.find('.results-header').hostNodes().exists()).toEqual(false);
  // No autograder result Card components should be rendered
  expect(tree.find('.ResultCard')).toHaveLength(0);
  // Expect each of the five testcases to have:
  //    Correct result rendered in the 'Actual result' cell
  //    Correct CSS styling applied to each Card (by className)
  const cards = tree.find('.AutograderCard');
  expect(cards).toHaveLength(5);
  expect(cards.map(node => node.getDOMNode().className)).toEqual(publicTestcaseCardClasses);
  const resultCells = cards.map(card => {
    return card.find('.testcase-actual').hostNodes().getDOMNode();
  });
  // textContent returns the value wrapped by the opening and closing tags of the
  // enclosing HTML node as a string: this means the
  //    === INTERPRETER RETURN TYPES ===
  //      number [2] will be returned as "2"
  //      string ["2"] will be returned as "\"2\""
  //      error message [Line 1: Error: 'Msg'] will be returned as "Line 1: Error \"Msg\""
  //    === OTHER TYPES ===
  //      default rendered ['No Answer'] will be returned as "No Answer"
  expect(resultCells.map(node => node.textContent)).toEqual([
    '"string"',
    'No Answer',
    '2',
    '4',
    'Line 3: Name a not declared.'
  ]);
});

test('Autograder renders hidden testcases with different statuses correctly', () => {
  const props: SideContentAutograderProps = {
    autogradingResults: [],
    testcases: mockHiddenTestcases,
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  // No autograder result Card components should be rendered
  expect(tree.find('.ResultCard')).toHaveLength(0);
  // Expect each of the four testcases to have:
  //    A placeholder cell rendered in place of the actual testcase data
  //    Correct CSS styling applied to each Card (by className)
  const cards = tree.find('.AutograderCard');
  expect(cards).toHaveLength(4);
  expect(cards.map(node => node.getDOMNode().className)).toEqual(hiddenTestcaseCardClasses);
  cards.forEach(card => {
    const placeholder = card.find('.testcase-placeholder').hostNodes().getDOMNode();
    expect(placeholder.textContent).toEqual('Hidden testcase');
  });
});

test('Autograder renders autograder results with different statuses correctly', () => {
  const props: SideContentAutograderProps = {
    autogradingResults: mockAutogradingResults,
    testcases: [],
    handleTestcaseEval: (testcaseId: number) => {}
  };
  const app = <SideContentAutograder {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect only the header <div> for autograder results section to be rendered
  expect(tree.find('.testcases-header').hostNodes().exists()).toEqual(false);
  expect(tree.find('.results-header').hostNodes().exists()).toEqual(true);
  // No testcase Card components should be rendered
  expect(tree.find('.AutograderCard')).toHaveLength(0);
  // Expect each of the three autograder results to have:
  //    Correct data rendered in the 'Testcase status', 'Expected result' and 'Actual result' cells
  //    Correct CSS styling applied to each Card
  const cards = tree.find('.ResultCard');
  expect(cards).toHaveLength(3);
  expect(cards.map(node => node.getDOMNode().className)).toEqual(resultCardClasses);
  // Extract the text contained within the cells: see above comment for textContent
  const resultCellsValues = cards.map(card => {
    return ['.result-idx', '.result-status', '.result-expected', '.result-actual'].map(id => {
      return card.find(id).hostNodes().getDOMNode().textContent;
    });
  });
  expect(resultCellsValues).toEqual([
    ['1', 'PASS', '', ''],
    ['2', 'FAIL', '8', '5'],
    [
      '3',
      'ERROR',
      '',
      'Timeout: Submission exceeded time limit for this test case.\nLine 1: Error: Just kidding!'
    ]
  ]);
});
