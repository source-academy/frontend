import { render } from '@testing-library/react';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';

import {
  CodeOutput,
  ErrorOutput,
  InterpreterOutput,
  ResultOutput,
  RunningOutput
} from '../../application/ApplicationTypes';
import { mockTypeError } from '../../mocks/ContextMocks';
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

test('Repl renders correctly', async () => {
  const props = {
    handleBrowseHistoryDown: () => {},
    handleBrowseHistoryUp: () => {},
    handleReplValueChange: (newCode: string) => {},
    handleReplEval: () => {},
    handleReplOutputClear: () => {},
    output: [mockResultOutput, mockCodeOutput, mockErrorOutput, mockRunningOutput],
    replValue: '',
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    externalLibrary: ExternalLibraryName.NONE,
    replButtons: []
  };
  const { asFragment } = render(<Repl {...props} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Code output renders correctly', async () => {
  const { asFragment } = render(<Output {...{ output: mockCodeOutput }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Running output renders correctly', async () => {
  const { asFragment } = render(<Output {...{ output: mockRunningOutput }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Result output (no consoleLogs) renders correctly', async () => {
  const { asFragment } = render(<Output {...{ output: mockResultOutput }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Result output (with consoleLogs) renders correctly', async () => {
  const props = {
    ...mockResultOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const { asFragment } = render(<Output {...{ output: props }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Error output (no consoleLogs) renders correctly', async () => {
  const { asFragment } = render(<Output {...{ output: mockErrorOutput }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Error output (with consoleLogs) renders correctly', async () => {
  const props = {
    ...mockErrorOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const { asFragment } = render(<Output {...{ output: props }} />);
  expect(asFragment()).toMatchSnapshot();
});

test('Empty output renders an empty card', async () => {
  const { asFragment } = render(<Output {...{ output: {} as InterpreterOutput }} />);
  expect(asFragment()).toMatchSnapshot();
});
