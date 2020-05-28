import { shallow } from 'enzyme';
import * as React from 'react';

import { mockTypeError } from '../../../mocks/context';
import {
  CodeOutput,
  ErrorOutput,
  InterpreterOutput,
  ResultOutput,
  RunningOutput
} from '../../application/ApplicationTypes';
import Repl, { Output } from '../Repl';

const mockRunningOutput: RunningOutput = {
  type: 'running',
  consoleLogs: ['a', 'bb', 'cccccccccccccccccccccccccccccccc', 'd']
};

const mockCodeOutput: CodeOutput = {
  type: 'code',
  value: "display('');"
};

const mockResultOutput: ResultOutput = {
  type: 'result',
  value: 42,
  consoleLogs: []
};

const mockErrorOutput: ErrorOutput = {
  type: 'errors',
  errors: [mockTypeError()],
  consoleLogs: []
};

test('Repl renders correctly', () => {
  const props = {
    handleBrowseHistoryDown: () => {},
    handleBrowseHistoryUp: () => {},
    handleReplValueChange: (newCode: string) => {},
    handleReplEval: () => {},
    handleReplOutputClear: () => {},
    output: [mockResultOutput, mockCodeOutput, mockErrorOutput, mockRunningOutput],
    replValue: ''
  };
  const app = <Repl {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Code output renders correctly', () => {
  const app = <Output {...{ output: mockCodeOutput }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Running output renders correctly', () => {
  const app = <Output {...{ output: mockRunningOutput }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Result output (no consoleLogs) renders correctly', () => {
  const app = <Output {...{ output: mockResultOutput }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Result output (with consoleLogs) renders correctly', () => {
  const props = {
    ...mockResultOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const app = <Output {...{ output: props }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Error output (no consoleLogs) renders correctly', () => {
  const app = <Output {...{ output: mockErrorOutput }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Error output (with consoleLogs) renders correctly', () => {
  const props = {
    ...mockErrorOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const app = <Output {...{ output: props }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Empty output renders an empty card', () => {
  const app = <Output {...{ output: {} as InterpreterOutput }} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
