import { shallow } from 'enzyme';
import { Variant } from 'js-slang/dist/types';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { Position } from '../../../commons/editor/EditorTypes';
import { mockRouterProps } from '../../../commons/mocks/ComponentMocks';
import Playground, { PlaygroundProps } from '../Playground';

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
  editorWidth: '50%',
  isEditorAutorun: false,
  sideContentHeight: 40,
  sourceChapter: 2,
  sourceVariant: 'default' as Variant,
  externalLibraryName: ExternalLibraryName.NONE,
  output: [],
  replValue: '',
  sharedbConnected: false,
  usingSubst: false,
  persistenceUser: undefined,
  persistenceFile: undefined,
  githubOctokitObject: { octokit: undefined },
  githubSaveInfo: { repoName: '', filePath: '' },
  handleBrowseHistoryDown: () => {},
  handleBrowseHistoryUp: () => {},
  handleChangeExecTime: (execTime: number) => {},
  handleChangeStepLimit: (stepLimit: number) => {},
  handleChapterSelect: (chapter: number) => {},
  handleDeclarationNavigate: (cursorPosition: Position) => {},
  handleEditorEval: () => {},
  handleEditorHeightChange: (height: number) => {},
  handleEditorValueChange: () => {},
  handleEditorWidthChange: (widthChange: number) => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => {},
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
