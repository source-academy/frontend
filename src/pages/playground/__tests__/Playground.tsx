import { shallow } from 'enzyme';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  ExternalLibraryName,
  ExternalLibraryNames
} from '../../../commons/application/types/ExternalTypes';
import { Position } from '../../../commons/editor/EditorTypes';
import { SideContentType } from '../../../commons/sideContent/SideContentTypes';
import { mockRouterProps } from '../../../mocks/components';
import Playground, { PlaygroundProps } from '../Playground';

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
  sourceVariant: 'default' as Variant,
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
  handleDeclarationNavigate: (cursorPosition: Position) => {},
  handleEditorEval: () => {},
  handleEditorHeightChange: (height: number) => {},
  handleEditorValueChange: () => {},
  handleEditorWidthChange: (widthChange: number) => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => {},
  handleFinishInvite: () => {},
  handleGenerateLz: () => {},
  handleShortenURL: () => {},
  handleUpdateShortURL: (s: string) => {},
  handleInterruptEval: () => {},
  handleInvalidEditorSessionId: () => {},
  handleReplEval: () => {},
  handleReplOutputClear: () => {},
  handleReplValueChange: (code: string) => {},
  handleSendReplInputToOutput: (code: string) => {},
  handleSetEditorSessionId: (editorSessionId: string) => {},
  handleInitInvite: (value: string) => {},
  handleSetWebsocketStatus: (websocketStatus: number) => {},
  handleSideContentHeightChange: (h: number) => {},
  handleToggleEditorAutorun: () => {},
  handleUsingSubst: (usingSubst: boolean) => {},
  handleDebuggerPause: () => {},
  handleDebuggerResume: () => {},
  handleDebuggerReset: () => {},
  handleFetchChapter: () => {},
  handlePromptAutocomplete: (row: number, col: number, callback: any) => {},
  handleProgramEval: (overallState : OverallState) => {}
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
