import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { RouteComponentProps } from 'react-router';

import { Variant } from 'js-slang/dist/types';
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
} from './workspace/controlBar/index';
import { IPosition } from './workspace/Editor';
import { SideContentTab } from './workspace/side-content';
import EnvVisualizer from './workspace/side-content/EnvVisualizer';
import FaceapiDisplay from './workspace/side-content/FaceapiDisplay';
import Inspector from './workspace/side-content/Inspector';
import ListVisualizer from './workspace/side-content/ListVisualizer';
import SubstVisualizer from './workspace/side-content/SubstVisualizer';
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

const CONCURRENT_SOURCE_INTRODUCTION = `

In Source ${CHAP}3 Concurrent, all programs are concurrent programs. Hence, they do not return any
result, and can only reflect trace through calls to the \`display\` function. This includes
programs that only use one thread and do not make any calls to \`concurrent_execute\`. To
run programs concurrently, use the \`concurrent_execute\` function. You may refer to Source
${CHAP}3 Concurrent specifications for more details.`;

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
  newCursorPosition?: IPosition;
  output: InterpreterOutput[];
  queryString?: string;
  replValue: string;
  sideContentHeight?: number;
  sharedbAceInitValue: string;
  sharedbAceIsInviting: boolean;
  sourceChapter: number;
  sourceVariant: Variant;
  websocketStatus: number;
  externalLibraryName: string;
  usingSubst: boolean;
}

export interface IDispatchProps {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeExecTime: (execTime: number) => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDeclarationNavigate: (cursorPosition: IPosition) => void;
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
  handleUsingSubst: (usingSubst: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleToggleEditorAutorun: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
}

type PlaygroundState = {
  isGreen: boolean;
  selectedTab: SideContentType;
  hasBreakpoints: boolean;
};

class Playground extends React.Component<IPlaygroundProps, PlaygroundState> {
  private keyMap = { goGreen: 'h u l k' };
  private handlers = { goGreen: () => {} };

  constructor(props: IPlaygroundProps) {
    super(props);
    this.state = {
      isGreen: false,
      selectedTab: SideContentType.introduction,
      hasBreakpoints: false
    };
    this.handlers.goGreen = this.toggleIsGreen.bind(this);
    (window as any).thePlayground = this;
  }

  public render() {
    const substVisualizerTab: SideContentTab = {
      label: 'Substituter',
      iconName: IconNames.FLOW_REVIEW,
      body: <SubstVisualizer content={this.processArrayOutput(this.props.output)} />,
      id: SideContentType.substVisualizer
    };

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

    const chapterSelectHandler = (
      { chapter, variant }: { chapter: number; variant: Variant },
      e: any
    ) => {
      if (
        (chapter <= 2 && this.state.hasBreakpoints) ||
        this.state.selectedTab === SideContentType.substVisualizer
      ) {
        this.props.handleUsingSubst(true);
      }
      if (chapter > 2) {
        this.props.handleReplOutputClear();
        this.props.handleUsingSubst(false);
      }
      this.props.handleChapterSelect(chapter, variant);
    };
    const chapterSelect = (
      <ChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={this.props.sourceChapter}
        sourceVariant={this.props.sourceVariant}
        key="chapter"
      />
    );

    const clearButton =
      this.state.selectedTab === SideContentType.substVisualizer ? null : (
        <ClearButton handleReplOutputClear={this.props.handleReplOutputClear} key="clear_repl" />
      );

    const evalButton =
      this.state.selectedTab === SideContentType.substVisualizer ? null : (
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

    const playgroundIntroductionTab: SideContentTab = {
      label: 'Introduction',
      iconName: IconNames.COMPASS,
      body: (
        <Markdown
          content={
            INTRODUCTION +
            (this.props.sourceVariant === 'concurrent' ? CONCURRENT_SOURCE_INTRODUCTION : '')
          }
          openLinksInNewWindow={true}
        />
      ),
      id: SideContentType.introduction
    };

    const tabs: SideContentTab[] = [playgroundIntroductionTab];

    // Conditional logic for tab rendering
    if (
      this.props.externalLibraryName === ExternalLibraryNames.PIXNFLIX ||
      this.props.externalLibraryName === ExternalLibraryNames.ALL
    ) {
      // Enable video tab only when 'PIX&FLIX' is selected
      tabs.push(videoDisplayTab);
    }
    if (this.props.externalLibraryName === ExternalLibraryNames.MACHINELEARNING) {
      // Enable Face API Display only when 'MACHINELEARNING' is selected
      tabs.push(FaceapiDisplayTab);
    }
    if (this.props.sourceChapter >= 2) {
      // Enable Data Visualizer for Source Chapter 2 and above
      tabs.push(listVisualizerTab);
    }
    if (this.props.sourceChapter >= 3 && this.props.sourceVariant !== 'concurrent') {
      // Enable Inspector, Env Visualizer for Source Chapter 3 and above
      tabs.push(inspectorTab);
      tabs.push(envVisualizerTab);
    }

    if (this.props.sourceChapter <= 2) {
      tabs.push(substVisualizerTab);
    }

    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorButtons: [
          autorunButtons,
          shareButton,
          chapterSelect,
          this.props.sourceVariant !== 'concurrent' ? externalLibrarySelect : null,
          sessionButtons,
          executionTime
        ],
        replButtons: [this.props.sourceVariant !== 'concurrent' ? evalButton : null, clearButton]
      },
      editorProps: {
        sourceChapter: this.props.sourceChapter,
        externalLibraryName: this.props.externalLibraryName,
        sourceVariant: this.props.sourceVariant,
        editorValue: this.props.editorValue,
        editorSessionId: this.props.editorSessionId,
        handleDeclarationNavigate: this.props.handleDeclarationNavigate,
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleReplValueChange: this.props.handleReplValueChange,
        handleReplEval: this.props.handleReplEval,
        handlePromptAutocomplete: this.props.handlePromptAutocomplete,
        handleFinishInvite: this.props.handleFinishInvite,
        sharedbAceInitValue: this.props.sharedbAceInitValue,
        sharedbAceIsInviting: this.props.sharedbAceIsInviting,
        isEditorAutorun: this.props.isEditorAutorun,
        breakpoints: this.props.breakpoints,
        highlightedLines: this.props.highlightedLines,
        newCursorPosition: this.props.newCursorPosition,
        handleEditorUpdateBreakpoints: (breakpoints: string[]) => {
          // get rid of holes in array
          const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
          if (numberOfBreakpoints > 0) {
            this.setState({
              ...this.state,
              hasBreakpoints: true
            });
            if (this.props.sourceChapter <= 2) {
              /**
               * There are breakpoints set on Source Chapter 2, so we set the
               * Redux state for the editor to evaluate to the substituter
               */

              this.props.handleUsingSubst(true);
            }
          }
          if (numberOfBreakpoints === 0) {
            this.setState({
              ...this.state,
              hasBreakpoints: false
            });

            if (this.state.selectedTab !== SideContentType.substVisualizer) {
              this.props.handleReplOutputClear();
              this.props.handleUsingSubst(false);
            }
          }
          this.props.handleEditorUpdateBreakpoints(breakpoints);
        },
        handleSetWebsocketStatus: this.props.handleSetWebsocketStatus
      },
      editorHeight: this.props.editorHeight,
      editorWidth: this.props.editorWidth,
      handleEditorHeightChange: this.props.handleEditorHeightChange,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      replProps: {
        sourceChapter: this.props.sourceChapter,
        sourceVariant: this.props.sourceVariant,
        output: this.props.output,
        replValue: this.props.replValue,
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange,
        hidden: this.state.selectedTab === SideContentType.substVisualizer,
        usingSubst: this.props.usingSubst
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: {
        defaultSelectedTabId: this.state.selectedTab,
        handleActiveTabChange: this.props.handleActiveTabChange,
        onChange: this.onChangeTabs,
        tabs
      },
      sideContentIsResizeable: this.state.selectedTab !== SideContentType.substVisualizer
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

  private onChangeTabs = (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (newTabId === prevTabId) {
      return;
    }

    if (this.props.sourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
      this.props.handleUsingSubst(true);
    }

    if (prevTabId === SideContentType.substVisualizer && !this.state.hasBreakpoints) {
      this.props.handleReplOutputClear();
      this.props.handleUsingSubst(false);
    }

    this.setState({
      ...this.state,
      selectedTab: newTabId
    });
  };

  private processArrayOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (editorOutput && editorOutput.type === 'result' && editorOutput.value instanceof Array) {
      return editorOutput.value;
    } else {
      return [];
    }
  };

  private toggleIsGreen() {
    this.setState({
      ...this.state,
      isGreen: !this.state.isGreen
    });
  }
}

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

const FaceapiDisplayTab: SideContentTab = {
  label: 'Face API Display',
  iconName: IconNames.MUGSHOT,
  body: <FaceapiDisplay />
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
