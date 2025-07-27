import { Chapter, Variant } from 'js-slang/dist/types';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { shallowRender } from 'src/commons/utils/TestUtils';

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

test('Repl renders correctly', () => {
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
  const app = <Repl {...props} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Code output renders correctly', () => {
  const app = <Output {...{ output: mockCodeOutput }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Running output renders correctly', () => {
  const app = <Output {...{ output: mockRunningOutput }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Result output (no consoleLogs) renders correctly', () => {
  const app = <Output {...{ output: mockResultOutput }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Result output (with consoleLogs) renders correctly', () => {
  const props = {
    ...mockResultOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const app = <Output {...{ output: props }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Error output (no consoleLogs) renders correctly', () => {
  const app = <Output {...{ output: mockErrorOutput }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Error output (with consoleLogs) renders correctly', () => {
  const props = {
    ...mockErrorOutput,
    consoleLogs: mockRunningOutput.consoleLogs
  };
  const app = <Output {...{ output: props }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});

test('Empty output renders an empty card', () => {
  const app = <Output {...{ output: {} as InterpreterOutput }} />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});
