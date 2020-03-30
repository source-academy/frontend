import { shallow } from 'enzyme';
import * as React from 'react';

import { SideContentType } from 'src/reducers/states';
import { mockRouterProps } from '../../mocks/components';
import { ExternalLibraryName, ExternalLibraryNames } from '../assessment/assessmentShape';
import Playground, { IPlaygroundProps } from '../Playground';
import { IPosition } from '../workspace/Editor';

const baseProps = {
  editorValue: '',
  execTime: 1000,
  breakpoints: [],
  highlightedLines: [],
  isRunning: false,
  isDebugging: false,
  enableDebugging: true,
  editorSessionId: '',
  editorWidth: '50%',
  isEditorAutorun: false,
  sharedbAceInitValue: '',
  sharedbAceIsInviting: false,
  sideContentHeight: 40,
  sourceChapter: 2,
  externalLibraryName: ExternalLibraryNames.NONE,
  output: [],
  replValue: '',
  websocketStatus: 0,
  usingSubst: false,
  handleActiveTabChange: (activeTab: SideContentType) => {},
  handleBrowseHistoryDown: () => {},
  handleBrowseHistoryUp: () => {},
  handleChangeExecTime: (execTime: number) => {},
  handleChapterSelect: (chapter: number) => {},
  handleDeclarationNavigate: (cursorPosition: IPosition) => {},
  handleEditorEval: () => {},
  handleEditorHeightChange: (height: number) => {},
  handleEditorValueChange: () => {},
  handleEditorWidthChange: (widthChange: number) => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => {},
  handleFinishInvite: () => {},
  handleGenerateLz: () => {},
  handleInterruptEval: () => {},
  handleInvalidEditorSessionId: () => {},
  handleReplEval: () => {},
  handleReplOutputClear: () => {},
  handleReplValueChange: (code: string) => {},
  handleSetEditorSessionId: (editorSessionId: string) => {},
  handleInitInvite: (value: string) => {},
  handleSetWebsocketStatus: (websocketStatus: number) => {},
  handleSideContentHeightChange: (h: number) => {},
  handleToggleEditorAutorun: () => {},
  handleUsingSubst: (usingSubst: boolean) => {},
  handleDebuggerPause: () => {},
  handleDebuggerResume: () => {},
  handleDebuggerReset: () => {},
  handlePromptAutocomplete: (row: number, col: number, callback: any) => {}
};

const testValueProps: IPlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/academy', {}),
  editorValue: 'Test value'
};

const playgroundLinkProps: IPlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/playground#lib=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA', {}),
  editorValue: 'This should not show up'
};

test('Playground renders correctly', () => {
  const app = <Playground {...testValueProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Playground with link renders correctly', () => {
  const app = <Playground {...playgroundLinkProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
