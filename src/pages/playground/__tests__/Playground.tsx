import { shallow } from 'enzyme';
import { Chapter, Variant } from 'js-slang/dist/types';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import { Position } from '../../../commons/editor/EditorTypes';
import { mockRouterProps } from '../../../commons/mocks/ComponentMocks';
import Playground, { handleHash, PlaygroundProps } from '../Playground';

const baseProps = {
  editorValue: '',
  execTime: 1000,
  stepLimit: 1000,
  breakpoints: [],
  highlightedLines: [],
  isRunning: false,
  isDebugging: false,
  enableDebugging: true,
  editorSessionId: '',
  isEditorAutorun: false,
  sideContentHeight: 40,
  playgroundSourceChapter: Chapter.SOURCE_2,
  playgroundSourceVariant: Variant.DEFAULT,
  output: [],
  replValue: '',
  sharedbConnected: false,
  usingSubst: false,
  persistenceUser: undefined,
  persistenceFile: undefined,
  githubOctokitObject: { octokit: undefined },
  githubSaveInfo: { repoName: '', filePath: '' },
  handleAddHtmlConsoleError: (errorMsg: string) => {},
  handleBrowseHistoryDown: () => {},
  handleBrowseHistoryUp: () => {},
  handleChangeExecTime: (execTime: number) => {},
  handleChangeStepLimit: (stepLimit: number) => {},
  handleChapterSelect: (chapter: Chapter) => {},
  handleDeclarationNavigate: (cursorPosition: Position) => {},
  handleEditorEval: () => {},
  handleEditorValueChange: () => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleFetchSublanguage: () => {},
  handleGenerateLz: () => {},
  handleShortenURL: () => {},
  handleUpdateShortURL: (s: string) => {},
  handleInterruptEval: () => {},
  handleReplEval: () => {},
  handleReplOutputClear: () => {},
  handleReplValueChange: (code: string) => {},
  handleSendReplInputToOutput: (code: string) => {},
  handleSetEditorSessionId: (editorSessionId: string) => {},
  handleSetSharedbConnected: (connected: boolean) => {},
  handleSideContentHeightChange: (h: number) => {},
  handleToggleEditorAutorun: () => {},
  handleUsingSubst: (usingSubst: boolean) => {},
  handleDebuggerPause: () => {},
  handleDebuggerResume: () => {},
  handleDebuggerReset: () => {},
  handleFetchChapter: () => {},
  handlePromptAutocomplete: (row: number, col: number, callback: any) => {},
  handlePersistenceOpenPicker: () => {},
  handlePersistenceSaveFile: () => {},
  handlePersistenceInitialise: () => {},
  handlePersistenceUpdateFile: () => {},
  handlePersistenceLogOut: () => {},
  handleGitHubOpenFile: () => {},
  handleGitHubSaveFileAs: () => {},
  handleGitHubSaveFile: () => {},
  handleGitHubLogIn: () => {},
  handleGitHubLogOut: () => {}
};

const testValueProps: PlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/academy', {}),
  editorValue: 'Test value'
};

const playgroundLinkProps: PlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/playground#lib=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA', {}),
  editorValue: 'This should not show up'
};

const mockStore = mockInitialStore();

test('Playground renders correctly', () => {
  const app = (
    <Provider store={mockStore}>
      <Playground {...testValueProps} />
    </Provider>
  );
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Playground with link renders correctly', () => {
  const app = (
    <Provider store={mockStore}>
      <Playground {...playgroundLinkProps} />
    </Provider>
  );
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

describe('handleHash', () => {
  test('disables loading hash with fullJS chapter in URL params', () => {
    const testHash = '#chap=-1&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA';

    const mockHandleEditorValueChanged = jest.fn();
    const mockHandleChapterSelect = jest.fn();
    const mockHandleChangeExecTime = jest.fn();

    handleHash(testHash, {
      ...playgroundLinkProps, // dummy props (will not be used)
      handleEditorValueChange: mockHandleEditorValueChanged,
      handleChapterSelect: mockHandleChapterSelect,
      handleChangeExecTime: mockHandleChangeExecTime
    });

    expect(mockHandleEditorValueChanged).not.toHaveBeenCalled();
    expect(mockHandleChapterSelect).not.toHaveBeenCalled();
    expect(mockHandleChangeExecTime).not.toHaveBeenCalled();
  });
});
