import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { RouteComponentProps } from 'react-router';

import { InterpreterOutput, SideContentType } from '../reducers/states';
import { LINKS } from '../utils/constants';
import { ExternalLibraryName, ExternalLibraryNames } from './assessment/assessmentShape';
import Markdown from './commons/Markdown';
import Workspace, { WorkspaceProps } from './workspace';
import {
  AutorunButtons,
  ChapterSelect,
  ClearButton,
  EvalButton,
  ExecutionTime,
  ExternalLibrarySelect,
  SessionButtons,
  ShareButton
} from './workspace/controlBarButtons';
import { SideContentTab } from './workspace/side-content';
import EnvVisualizer from './workspace/side-content/EnvVisualizer';
import Inspector from './workspace/side-content/Inspector';
import ListVisualizer from './workspace/side-content/ListVisualizer';
import VideoDisplay from './workspace/side-content/VideoDisplay';

const CHAP = '\xa7';

const INTRODUCTION = `
Welcome to the Source Academy playground!

The language _Source_ is the official language of the textbook [_Structure and
Interpretation of Computer Programs, JavaScript Adaptation_](${LINKS.TEXTBOOK}).
You have never heard of Source? No worries! It was invented just for the purpose
of the book. Source is a sublanguage of ECMAScript 2016 (7th edition) and defined
in [the documents titled _"Source ${CHAP}x"_](${LINKS.SOURCE_DOCS}), where x
refers to the respective textbook chapter. For example, Source ${CHAP}3 is
suitable for textbook chapter 3 and the preceeding chapters.

The playground comes with an editor and a REPL, on the left and right of the
screen, respectively. You may customise the layout of the playground by
clicking and dragging on the right border of the editor, or the top border of
the REPL.
`;

export interface IPlaygroundProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export interface IStateProps {
  editorSessionId: string;
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  execTime: number;
  breakpoints: string[];
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  queryString?: string;
  replValue: string;
  sideContentHeight?: number;
  sharedbAceInitValue: string;
  sharedbAceIsInviting: boolean;
  sourceChapter: number;
  websocketStatus: number;
  externalLibraryName: string;
}

export interface IDispatchProps {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeExecTime: (execTime: number) => void;
  handleChapterSelect: (chapter: number) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite: () => void;
  handleGenerateLz: () => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId: () => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleInitInvite: (value: string) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetWebsocketStatus: (websocketStatus: number) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleToggleEditorAutorun: () => void;
}

type PlaygroundState = {
  isGreen: boolean;
};

class Playground extends React.Component<IPlaygroundProps, PlaygroundState> {
  private keyMap = { goGreen: 'h u l k' };

  private handlers = { goGreen: () => {} };

  constructor(props: IPlaygroundProps) {
    super(props);
    this.state = { isGreen: false };
    this.handlers.goGreen = this.toggleIsGreen.bind(this);
  }

  public render() {
    const autorunButtons = (
      <AutorunButtons
        handleDebuggerPause={this.props.handleDebuggerPause}
        handleDebuggerReset={this.props.handleDebuggerReset}
        handleDebuggerResume={this.props.handleDebuggerResume}
        handleEditorEval={this.props.handleEditorEval}
        handleInterruptEval={this.props.handleInterruptEval}
        handleToggleEditorAutorun={this.props.handleToggleEditorAutorun}
        isDebugging={this.props.isDebugging}
        isEditorAutorun={this.props.isEditorAutorun}
        isRunning={this.props.isRunning}
        key="autorun"
      />
    );

    const chapterSelectHandler = ({ chapter }: { chapter: number }, e: any) =>
      this.props.handleChapterSelect(chapter);
    const chapterSelect = (
      <ChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={this.props.sourceChapter}
        key="chapter"
      />
    );

    const clearButton = (
      <ClearButton handleReplOutputClear={this.props.handleReplOutputClear} key="clear_repl" />
    );

    const evalButton = (
      <EvalButton
        handleReplEval={this.props.handleReplEval}
        isRunning={this.props.isRunning}
        key="eval_repl"
      />
    );

    const changeExecutionTimeHandler = (execTime: number) =>
      this.props.handleChangeExecTime(execTime);
    const executionTime = (
      <ExecutionTime
        execTime={this.props.execTime}
        handleChangeExecTime={changeExecutionTimeHandler}
        key="execution_time"
      />
    );

    const externalLibrarySelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) =>
      this.props.handleExternalSelect(name);
    const externalLibrarySelect = (
      <ExternalLibrarySelect
        externalLibraryName={this.props.externalLibraryName}
        handleExternalSelect={externalLibrarySelectHandler}
        key="external_library"
      />
    );

    const sessionButtons = (
      <SessionButtons
        editorSessionId={this.props.editorSessionId}
        editorValue={this.props.editorValue}
        handleInitInvite={this.props.handleInitInvite}
        handleInvalidEditorSessionId={this.props.handleInvalidEditorSessionId}
        handleSetEditorSessionId={this.props.handleSetEditorSessionId}
        websocketStatus={this.props.websocketStatus}
        key="session"
      />
    );

    const shareButton = (
      <ShareButton
        handleGenerateLz={this.props.handleGenerateLz}
        queryString={this.props.queryString}
        key="share"
      />
    );
    
    const tabs: SideContentTab[] = [
      playgroundIntroductionTab,
      listVisualizerTab,
      inspectorTab,
      envVisualizerTab
    ];

    if (
      this.props.externalLibraryName === ExternalLibraryNames.PIXNFLIX ||
      this.props.externalLibraryName === ExternalLibraryNames.ALL
    ) {
      tabs.push(videoDisplayTab);
    }

    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorButtons: [
          autorunButtons,
          shareButton,
          chapterSelect,
          externalLibrarySelect,
          sessionButtons,
          executionTime
        ],
        replButtons: [evalButton, clearButton]
      },
      editorProps: {
        editorValue: this.props.editorValue,
        editorSessionId: this.props.editorSessionId,
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleFinishInvite: this.props.handleFinishInvite,
        sharedbAceInitValue: this.props.sharedbAceInitValue,
        sharedbAceIsInviting: this.props.sharedbAceIsInviting,
        isEditorAutorun: this.props.isEditorAutorun,
        breakpoints: this.props.breakpoints,
        highlightedLines: this.props.highlightedLines,
        handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
        handleSetWebsocketStatus: this.props.handleSetWebsocketStatus
      },
      editorHeight: this.props.editorHeight,
      editorWidth: this.props.editorWidth,
      handleEditorHeightChange: this.props.handleEditorHeightChange,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      replProps: {
        output: this.props.output,
        replValue: this.props.replValue,
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: {
        defaultSelectedTabId: SideContentType.introduction,
        handleActiveTabChange: this.props.handleActiveTabChange,
        tabs
      }
    };

    return (
      <HotKeys
        className={classNames(
          'Playground',
          Classes.DARK,
          this.state.isGreen ? 'GreenScreen' : undefined
        )}
        keyMap={this.keyMap}
        handlers={this.handlers}
      >
        <Workspace {...workspaceProps} />
      </HotKeys>
    );
  }

  private toggleIsGreen() {
    this.setState({ isGreen: !this.state.isGreen });
  }
}

const playgroundIntroductionTab: SideContentTab = {
  label: 'Introduction',
  iconName: IconNames.COMPASS,
  body: <Markdown content={INTRODUCTION} />,
  id: SideContentType.introduction
};

const listVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <ListVisualizer />,
  id: SideContentType.dataVisualiser
};

const videoDisplayTab: SideContentTab = {
  label: 'Video Display',
  iconName: IconNames.MOBILE_VIDEO,
  body: <VideoDisplay />
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  iconName: IconNames.SEARCH,
  body: <Inspector />,
  id: SideContentType.inspector
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <EnvVisualizer />,
  id: SideContentType.envVisualiser
};

export default Playground;
