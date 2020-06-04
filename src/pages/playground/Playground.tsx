import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { RouteComponentProps } from 'react-router';

import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import { Variant } from 'js-slang/dist/types';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import {
  ExternalLibraryName,
  ExternalLibraryNames
} from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExecutionTime } from '../../commons/controlBar/ControlBarExecutionTime';
import { ControlBarExternalLibrarySelect } from '../../commons/controlBar/ControlBarExternalLibrarySelect';
import { ControlBarSessionButtons } from '../../commons/controlBar/ControlBarSessionButton';
import { ControlBarShareButton } from '../../commons/controlBar/ControlBarShareButton';
import { Position } from '../../commons/editor/EditorTypes';
import Markdown from '../../commons/Markdown';
import SideContentEnvVisualizer from '../../commons/sideContent/SideContentEnvVisualizer';
import SideContentFaceapiDisplay from '../../commons/sideContent/SideContentFaceapiDisplay';
import SideContentInspector from '../../commons/sideContent/SideContentInspector';
import SideContentListVisualizer from '../../commons/sideContent/SideContentListVisualizer';
import SideContentSubstVisualizer from '../../commons/sideContent/SideContentSubstVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import SideContentVideoDisplay from '../../commons/sideContent/SideContentVideoDisplay';
import { generateSourceIntroduction } from '../../commons/utils/IntroductionHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import { WorkspaceLocations } from '../../commons/workspace/WorkspaceTypes';

export type PlaygroundProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeExecTime: (execTime: number) => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite: () => void;
  handleGenerateLz: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId: () => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleInitInvite: (value: string) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetWebsocketStatus: (websocketStatus: number) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleToggleEditorAutorun: () => void;
  handleFetchChapter: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
};

export type StateProps = {
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
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  queryString?: string;
  shortURL?: string;
  replValue: string;
  sideContentHeight?: number;
  sharedbAceInitValue: string;
  sharedbAceIsInviting: boolean;
  sourceChapter: number;
  sourceVariant: Variant;
  websocketStatus: number;
  externalLibraryName: string;
  usingSubst: boolean;
};

type State = {
  isGreen: boolean;
  selectedTab: SideContentType;
  hasBreakpoints: boolean;
};

class Playground extends React.Component<PlaygroundProps, State> {
  private keyMap = { goGreen: 'h u l k' };
  private handlers = { goGreen: () => {} };

  constructor(props: PlaygroundProps) {
    super(props);
    this.state = {
      isGreen: false,
      selectedTab: SideContentType.introduction,
      hasBreakpoints: false
    };
    this.handlers.goGreen = this.toggleIsGreen.bind(this);
    (window as any).thePlayground = this;
    this.props.handleFetchChapter();
  }

  public render() {
    const autorunButtons = (
      <ControlBarAutorunButtons
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
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={this.props.sourceChapter}
        sourceVariant={this.props.sourceVariant}
        key="chapter"
      />
    );

    const clearButton =
      this.state.selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarClearButton
          handleReplOutputClear={this.props.handleReplOutputClear}
          key="clear_repl"
        />
      );

    const evalButton =
      this.state.selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarEvalButton
          handleReplEval={this.props.handleReplEval}
          isRunning={this.props.isRunning}
          key="eval_repl"
        />
      );

    const changeExecutionTimeHandler = (execTime: number) =>
      this.props.handleChangeExecTime(execTime);
    const executionTime = (
      <ControlBarExecutionTime
        execTime={this.props.execTime}
        handleChangeExecTime={changeExecutionTimeHandler}
        key="execution_time"
      />
    );

    const externalLibrarySelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) =>
      this.props.handleExternalSelect(name);
    const externalLibrarySelect = (
      <ControlBarExternalLibrarySelect
        externalLibraryName={this.props.externalLibraryName}
        handleExternalSelect={externalLibrarySelectHandler}
        key="external_library"
      />
    );

    const sessionButtons = (
      <ControlBarSessionButtons
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
      <ControlBarShareButton
        handleGenerateLz={this.props.handleGenerateLz}
        handleShortenURL={this.props.handleShortenURL}
        handleUpdateShortURL={this.props.handleUpdateShortURL}
        queryString={this.props.queryString}
        shortURL={this.props.shortURL}
        key="share"
      />
    );

    const playgroundIntroductionTab: SideContentTab = {
      label: 'Introduction',
      iconName: IconNames.COMPASS,
      body: (
        <Markdown
          content={generateSourceIntroduction(this.props.sourceChapter, this.props.sourceVariant)}
          openLinksInNewWindow={true}
        />
      ),
      id: SideContentType.introduction,
      toSpawn: () => true,
      toDespawn: () => false
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
    if (
      this.props.sourceChapter >= 3 &&
      this.props.sourceVariant !== 'concurrent' &&
      this.props.sourceVariant !== 'non-det'
    ) {
      // Enable Inspector, Env Visualizer for Source Chapter 3 and above
      tabs.push(inspectorTab);
      tabs.push(envVisualizerTab);
    }

    if (this.props.sourceChapter <= 2 && this.props.sourceVariant !== 'wasm') {
      // Enable Subst Visualizer for Source 1 & 2
      tabs.push({
        label: 'Substituter',
        iconName: IconNames.FLOW_REVIEW,
        body: <SideContentSubstVisualizer content={this.processStepperOutput(this.props.output)} />,
        id: SideContentType.substVisualizer,
        toSpawn: () => true,
        toDespawn: () => false
      });
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
        handleSendReplInputToOutput: this.props.handleSendReplInputToOutput,
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
        tabs,
        workspaceLocation: WorkspaceLocations.playground
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

  private processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      isStepperOutput(editorOutput.value[0])
    ) {
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
  body: <SideContentListVisualizer />,
  id: SideContentType.dataVisualiser,
  toSpawn: () => true,
  toDespawn: () => false
};

const videoDisplayTab: SideContentTab = {
  label: 'Video Display',
  iconName: IconNames.MOBILE_VIDEO,
  body: <SideContentVideoDisplay />,
  toSpawn: () => true,
  toDespawn: () => false
};

const FaceapiDisplayTab: SideContentTab = {
  label: 'Face API Display',
  iconName: IconNames.MUGSHOT,
  body: <SideContentFaceapiDisplay />,
  toSpawn: () => true,
  toDespawn: () => false
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  iconName: IconNames.SEARCH,
  body: <SideContentInspector />,
  id: SideContentType.inspector,
  toSpawn: () => true,
  toDespawn: () => false
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualiser,
  toSpawn: () => true,
  toDespawn: () => false
};

export default Playground;
