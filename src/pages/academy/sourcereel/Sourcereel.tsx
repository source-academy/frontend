import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';

import { InterpreterOutput } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExternalLibrarySelect } from '../../../commons/controlBar/ControlBarExternalLibrarySelect';
import { Position } from '../../../commons/editor/EditorTypes';
import SideContentDataVisualizer from '../../../commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../../commons/sideContent/SideContentEnvVisualizer';
import { SideContentTab, SideContentType } from '../../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../../commons/sourceRecorder/SourceRecorderControlBar';
import SourcecastEditor, {
  SourceRecorderEditorProps
} from '../../../commons/sourceRecorder/SourceRecorderEditor';
import SourcecastTable from '../../../commons/sourceRecorder/SourceRecorderTable';
import Workspace, { WorkspaceProps } from '../../../commons/workspace/Workspace';
import { EditorTabState } from '../../../commons/workspace/WorkspaceTypes';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  PlaybackData,
  PlaybackStatus,
  RecordingStatus,
  SourcecastData
} from '../../../features/sourceRecorder/SourceRecorderTypes';
import SourcereelControlbar from './subcomponents/SourcereelControlbar';

type SourcereelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleDeleteSourcecastEntry: (id: number) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleFetchSourcecastIndex: () => void;
  handleInterruptEval: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleResetInputs: (inputs: Input[]) => void;
  handleRecordInput: (input: Input) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleRecordInit: (initData: PlaybackData['init']) => void;
  handleSaveSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audio: Blob,
    playbackData: PlaybackData
  ) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  handleSetCurrentPlayerTime: (playTime: number) => void;
  handleSetCodeDeltasToApply: (delta: CodeDelta[]) => void;
  handleSetIsEditorReadonly: (isEditorReadonly: boolean) => void;
  handleSetInputToApply: (inputToApply: Input) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTimerPause: () => void;
  handleTimerReset: () => void;
  handleTimerResume: (timeBefore: number) => void;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  handleToggleEditorAutorun: () => void;
};

export type StateProps = {
  audioUrl: string;
  currentPlayerTime: number;
  codeDeltasToApply: CodeDelta[] | null;
  activeEditorTabIndex: number | null;
  editorTabs: EditorTabState[];
  isEditorReadonly: boolean;
  enableDebugging: boolean;
  externalLibraryName: ExternalLibraryName;
  inputToApply: Input | null;
  isDebugging: boolean;
  isEditorAutorun: boolean;
  isRunning: boolean;
  output: InterpreterOutput[];
  playbackData: PlaybackData;
  playbackDuration: number;
  playbackStatus: PlaybackStatus;
  recordingStatus: RecordingStatus;
  replValue: string;
  timeElapsedBeforePause: number;
  sideContentHeight?: number;
  sourcecastIndex: SourcecastData[] | null;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  timeResumed: number;
  courseId?: number;
};

type State = {
  selectedTab: SideContentType;
};

class Sourcereel extends React.Component<SourcereelProps, State> {
  public constructor(props: SourcereelProps) {
    super(props);

    this.state = {
      selectedTab: SideContentType.sourcereel
    };
  }

  public componentDidMount() {
    this.props.handleFetchSourcecastIndex();
  }

  public componentDidUpdate(prevProps: SourcereelProps) {
    const { inputToApply } = this.props;

    if (!inputToApply || inputToApply === prevProps.inputToApply) {
      return;
    }

    switch (inputToApply.type) {
      case 'activeTabChange':
        this.setState({ selectedTab: inputToApply.data });
        break;
      case 'chapterSelect':
        this.props.handleChapterSelect(inputToApply.data);
        break;
      case 'externalLibrarySelect':
        this.props.handleExternalSelect(inputToApply.data);
        break;
      case 'forcePause':
        this.props.handleSetSourcecastStatus(PlaybackStatus.forcedPaused);
        break;
    }
  }

  public render() {
    const editorEvalHandler = () => {
      this.props.handleEditorEval();
      if (this.props.recordingStatus !== RecordingStatus.recording) {
        return;
      }
      this.props.handleRecordInput({
        time: this.getTimerDuration(),
        type: 'keyboardCommand',
        data: KeyboardCommand.run
      });
    };
    const autorunButtons = (
      <ControlBarAutorunButtons
        handleDebuggerPause={this.props.handleDebuggerPause}
        handleDebuggerReset={this.props.handleDebuggerReset}
        handleDebuggerResume={this.props.handleDebuggerResume}
        handleEditorEval={editorEvalHandler}
        handleInterruptEval={this.props.handleInterruptEval}
        handleToggleEditorAutorun={this.props.handleToggleEditorAutorun}
        isDebugging={this.props.isDebugging}
        isEditorAutorun={this.props.isEditorAutorun}
        isRunning={this.props.isRunning}
        key="autorun"
      />
    );

    const chapterSelectHandler = ({ chapter }: { chapter: Chapter }, e: any) => {
      this.props.handleChapterSelect(chapter);
      if (this.props.recordingStatus !== RecordingStatus.recording) {
        return;
      }
      this.props.handleRecordInput({
        time: this.getTimerDuration(),
        type: 'chapterSelect',
        data: chapter
      });
    };

    const chapterSelect = (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={this.props.sourceChapter}
        sourceVariant={this.props.sourceVariant}
        key="chapter"
      />
    );

    const clearButton = (
      <ControlBarClearButton
        handleReplOutputClear={this.props.handleReplOutputClear}
        key="clear_repl"
      />
    );

    const evalButton = (
      <ControlBarEvalButton
        handleReplEval={this.props.handleReplEval}
        isRunning={this.props.isRunning}
        key="eval_repl"
      />
    );

    const externalSelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) => {
      this.props.handleExternalSelect(name);
      if (this.props.recordingStatus !== RecordingStatus.recording) {
        return;
      }
      this.props.handleRecordInput({
        time: this.getTimerDuration(),
        type: 'externalLibrarySelect',
        data: name
      });
    };

    const externalLibrarySelect = (
      <ControlBarExternalLibrarySelect
        externalLibraryName={this.props.externalLibraryName}
        handleExternalSelect={externalSelectHandler}
        key="external_library"
      />
    );

    const editorProps: SourceRecorderEditorProps = {
      codeDeltasToApply: this.props.codeDeltasToApply,
      isEditorReadonly: this.props.isEditorReadonly,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: this.props.editorTabs[0].value,
      editorSessionId: '',
      getTimerDuration: this.getTimerDuration,
      handleDeclarationNavigate: this.props.handleDeclarationNavigate,
      handleEditorEval: this.props.handleEditorEval,
      handleEditorValueChange: this.props.handleEditorValueChange,
      isEditorAutorun: this.props.isEditorAutorun,
      inputToApply: this.props.inputToApply,
      isPlaying: this.props.playbackStatus === PlaybackStatus.playing,
      isRecording: this.props.recordingStatus === RecordingStatus.recording,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      highlightedLines: this.props.editorTabs[0].highlightedLines,
      breakpoints: this.props.editorTabs[0].breakpoints,
      newCursorPosition: this.props.editorTabs[0].newCursorPosition,
      handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
      handleRecordInput: this.props.handleRecordInput
    };

    const activeTabChangeHandler = (activeTab: SideContentType) => {
      this.setState({ selectedTab: activeTab });
      if (this.props.recordingStatus !== RecordingStatus.recording) {
        return;
      }
      this.props.handleRecordInput({
        time: this.getTimerDuration(),
        type: 'activeTabChange',
        data: activeTab
      });
    };

    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorButtons: [autorunButtons, chapterSelect, externalLibrarySelect]
      },
      customEditor: <SourcecastEditor {...editorProps} />,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      replProps: {
        output: this.props.output,
        replValue: this.props.replValue,
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange,
        sourceChapter: this.props.sourceChapter,
        sourceVariant: this.props.sourceVariant,
        externalLibrary: this.props.externalLibraryName,
        replButtons: [evalButton, clearButton]
      },
      sideBarProps: {
        tabs: []
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: {
        onChange: activeTabChangeHandler,
        selectedTabId: this.state.selectedTab,
        /**
         * NOTE: An ag-grid console warning is shown here on load as the 'Sourcecast Table' tab
         * is not the default tab, and the ag-grid table inside it has not been rendered.
         * This is a known issue with ag-grid, and is okay since only staff and admins have
         * access to Sourcereel. For more info, see issue #1152 in frontend.
         */
        tabs: {
          beforeDynamicTabs: [
            {
              label: 'Recording Panel',
              iconName: IconNames.COMPASS,
              body: (
                <div>
                  <span className="Multi-line">
                    <Pre> {INTRODUCTION} </Pre>
                  </span>
                  <SourcereelControlbar
                    currentPlayerTime={this.props.currentPlayerTime}
                    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
                    editorValue={this.props.editorTabs[0].value}
                    getTimerDuration={this.getTimerDuration}
                    playbackData={this.props.playbackData}
                    handleRecordInit={this.handleRecordInit}
                    handleRecordPause={this.handleRecordPause}
                    handleResetInputs={this.props.handleResetInputs}
                    handleSaveSourcecastData={this.props.handleSaveSourcecastData}
                    handleSetSourcecastData={this.props.handleSetSourcecastData}
                    handleSetIsEditorReadonly={this.props.handleSetIsEditorReadonly}
                    handleTimerPause={this.props.handleTimerPause}
                    handleTimerReset={this.props.handleTimerReset}
                    handleTimerResume={this.props.handleTimerResume}
                    handleTimerStart={this.props.handleTimerStart}
                    handleTimerStop={this.props.handleTimerStop}
                    recordingStatus={this.props.recordingStatus}
                  />
                </div>
              ),
              id: SideContentType.sourcereel
            },
            {
              label: 'Sourcecast Table',
              iconName: IconNames.EDIT,
              body: (
                <div>
                  <SourcecastTable
                    handleDeleteSourcecastEntry={this.props.handleDeleteSourcecastEntry}
                    sourcecastIndex={this.props.sourcecastIndex}
                    courseId={this.props.courseId}
                  />
                </div>
              ),
              id: SideContentType.introduction
            },
            dataVisualizerTab,
            envVisualizerTab
          ],
          afterDynamicTabs: []
        },
        workspaceLocation: 'sourcereel'
      }
    };
    const sourcecastControlbarProps: SourceRecorderControlBarProps = {
      handleEditorValueChange: this.props.handleEditorValueChange,
      handlePromptAutocomplete: this.props.handlePromptAutocomplete,
      handleSetCurrentPlayerTime: this.props.handleSetCurrentPlayerTime,
      handleSetCodeDeltasToApply: this.props.handleSetCodeDeltasToApply,
      handleSetIsEditorReadonly: this.props.handleSetIsEditorReadonly,
      handleSetInputToApply: this.props.handleSetInputToApply,
      handleSetSourcecastDuration: this.props.handleSetSourcecastDuration,
      handleSetSourcecastStatus: this.props.handleSetSourcecastStatus,
      audioUrl: this.props.audioUrl,
      currentPlayerTime: this.props.currentPlayerTime,
      duration: this.props.playbackDuration,
      playbackData: this.props.playbackData,
      playbackStatus: this.props.playbackStatus,
      handleChapterSelect: this.props.handleChapterSelect,
      handleExternalSelect: this.props.handleExternalSelect
    };
    return (
      <div className={classNames('Sourcereel', Classes.DARK)}>
        {this.props.recordingStatus === RecordingStatus.paused ? (
          <SourceRecorderControlBar {...sourcecastControlbarProps} />
        ) : undefined}
        <Workspace {...workspaceProps} />
      </div>
    );
  }

  public getTimerDuration = () =>
    this.props.timeElapsedBeforePause + Date.now() - this.props.timeResumed;

  private handleRecordInit = () =>
    this.props.handleRecordInit({
      chapter: this.props.sourceChapter,
      externalLibrary: this.props.externalLibraryName as ExternalLibraryName,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: this.props.editorTabs[0].value
    });

  private handleRecordPause = () =>
    this.props.handleRecordInput({
      time: this.getTimerDuration(),
      type: 'forcePause',
      data: null
    });
}

const INTRODUCTION = 'Welcome to Sourcereel!';

const dataVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer />,
  id: SideContentType.dataVisualizer
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualizer
};

export default Sourcereel;
