import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

import { InterpreterOutput } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExternalLibrarySelect } from '../../../commons/controlBar/ControlBarExternalLibrarySelect';
import { HighlightedLines, Position } from '../../../commons/editor/EditorTypes';
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
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
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
  breakpoints: string[];
  editorReadonly: boolean;
  editorValue: string;
  enableDebugging: boolean;
  externalLibraryName: ExternalLibraryName;
  highlightedLines: HighlightedLines[];
  inputToApply: Input | null;
  isDebugging: boolean;
  isEditorAutorun: boolean;
  isRunning: boolean;
  newCursorPosition?: Position;
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

const Sourcereel: React.FC<SourcereelProps> = props => {
  const [selectedTab, setSelectedTab] = useState(SideContentType.sourcereel);

  useEffect(() => props.handleFetchSourcecastIndex(), []);

  useEffect(() => {
    const { inputToApply } = props;

    if (!inputToApply) {
      return;
    }

    switch (inputToApply.type) {
      case 'activeTabChange':
        setSelectedTab(inputToApply.data);
        break;
      case 'chapterSelect':
        props.handleChapterSelect(inputToApply.data);
        break;
      case 'externalLibrarySelect':
        props.handleExternalSelect(inputToApply.data);
        break;
      case 'forcePause':
        props.handleSetSourcecastStatus(PlaybackStatus.forcedPaused);
        break;
    }
  }, [props.inputToApply]);

  const getTimerDuration = () => props.timeElapsedBeforePause + Date.now() - props.timeResumed;

  const handleRecordInit = () =>
    props.handleRecordInit({
      chapter: props.sourceChapter,
      externalLibrary: props.externalLibraryName as ExternalLibraryName,
      editorValue: props.editorValue
    });

  const handleRecordPause = () =>
    props.handleRecordInput({
      time: getTimerDuration(),
      type: 'forcePause',
      data: null
    });

  const editorEvalHandler = () => {
    props.handleEditorEval();
    if (props.recordingStatus !== RecordingStatus.recording) {
      return;
    }
    props.handleRecordInput({
      time: getTimerDuration(),
      type: 'keyboardCommand',
      data: KeyboardCommand.run
    });
  };
  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={props.handleDebuggerPause}
      handleDebuggerReset={props.handleDebuggerReset}
      handleDebuggerResume={props.handleDebuggerResume}
      handleEditorEval={editorEvalHandler}
      handleInterruptEval={props.handleInterruptEval}
      handleToggleEditorAutorun={props.handleToggleEditorAutorun}
      isDebugging={props.isDebugging}
      isEditorAutorun={props.isEditorAutorun}
      isRunning={props.isRunning}
      key="autorun"
    />
  );

  const chapterSelectHandler = ({ chapter }: { chapter: Chapter }, e: any) => {
    props.handleChapterSelect(chapter);
    if (props.recordingStatus !== RecordingStatus.recording) {
      return;
    }
    props.handleRecordInput({
      time: getTimerDuration(),
      type: 'chapterSelect',
      data: chapter
    });
  };

  const chapterSelect = (
    <ControlBarChapterSelect
      handleChapterSelect={chapterSelectHandler}
      sourceChapter={props.sourceChapter}
      sourceVariant={props.sourceVariant}
      key="chapter"
    />
  );

  const clearButton = (
    <ControlBarClearButton handleReplOutputClear={props.handleReplOutputClear} key="clear_repl" />
  );

  const evalButton = (
    <ControlBarEvalButton
      handleReplEval={props.handleReplEval}
      isRunning={props.isRunning}
      key="eval_repl"
    />
  );

  const externalSelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) => {
    props.handleExternalSelect(name);
    if (props.recordingStatus !== RecordingStatus.recording) {
      return;
    }
    props.handleRecordInput({
      time: getTimerDuration(),
      type: 'externalLibrarySelect',
      data: name
    });
  };

  const externalLibrarySelect = (
    <ControlBarExternalLibrarySelect
      externalLibraryName={props.externalLibraryName}
      handleExternalSelect={externalSelectHandler}
      key="external_library"
    />
  );

  const editorProps: SourceRecorderEditorProps = {
    ..._.pick(
      props,
      'codeDeltasToApply',
      'editorReadonly',
      'editorValue',
      'handleDeclarationNavigate',
      'handleEditorEval',
      'handleEditorValueChange',
      'isEditorAutorun',
      'inputToApply',
      'breakpoints',
      'highlightedLines',
      'newCursorPosition',
      'handleEditorUpdateBreakpoints',
      'handleRecordInput'
    ),
    editorSessionId: '',
    getTimerDuration: getTimerDuration,
    isPlaying: props.playbackStatus === PlaybackStatus.playing,
    isRecording: props.recordingStatus === RecordingStatus.recording
  };

  const activeTabChangeHandler = (activeTab: SideContentType) => {
    setSelectedTab(activeTab);
    if (props.recordingStatus !== RecordingStatus.recording) {
      return;
    }
    props.handleRecordInput({
      time: getTimerDuration(),
      type: 'activeTabChange',
      data: activeTab
    });
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelect, externalLibrarySelect]
    },
    customEditor: <SourcecastEditor {...editorProps} />,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    replProps: {
      output: props.output,
      replValue: props.replValue,
      handleBrowseHistoryDown: props.handleBrowseHistoryDown,
      handleBrowseHistoryUp: props.handleBrowseHistoryUp,
      handleReplEval: props.handleReplEval,
      handleReplValueChange: props.handleReplValueChange,
      sourceChapter: props.sourceChapter,
      sourceVariant: props.sourceVariant,
      externalLibrary: props.externalLibraryName,
      replButtons: [evalButton, clearButton]
    },
    sideBarProps: {
      tabs: []
    },
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      onChange: activeTabChangeHandler,
      selectedTabId: selectedTab,
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
                  currentPlayerTime={props.currentPlayerTime}
                  editorValue={props.editorValue}
                  getTimerDuration={getTimerDuration}
                  playbackData={props.playbackData}
                  handleRecordInit={handleRecordInit}
                  handleRecordPause={handleRecordPause}
                  handleResetInputs={props.handleResetInputs}
                  handleSaveSourcecastData={props.handleSaveSourcecastData}
                  handleSetSourcecastData={props.handleSetSourcecastData}
                  handleSetEditorReadonly={props.handleSetEditorReadonly}
                  handleTimerPause={props.handleTimerPause}
                  handleTimerReset={props.handleTimerReset}
                  handleTimerResume={props.handleTimerResume}
                  handleTimerStart={props.handleTimerStart}
                  handleTimerStop={props.handleTimerStop}
                  recordingStatus={props.recordingStatus}
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
                  handleDeleteSourcecastEntry={props.handleDeleteSourcecastEntry}
                  sourcecastIndex={props.sourcecastIndex}
                  courseId={props.courseId}
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
    ..._.pick(
      props,
      'handleEditorValueChange',
      'handlePromptAutocomplete',
      'handleSetCurrentPlayerTime',
      'handleSetCodeDeltasToApply',
      'handleSetEditorReadonly',
      'handleSetInputToApply',
      'handleSetSourcecastDuration',
      'handleSetSourcecastStatus',
      'audioUrl',
      'currentPlayerTime',
      'playbackData',
      'playbackStatus',
      'handleChapterSelect',
      'handleExternalSelect'
    ),
    duration: props.playbackDuration
  };
  return (
    <div className={classNames('Sourcereel', Classes.DARK)}>
      {props.recordingStatus === RecordingStatus.paused ? (
        <SourceRecorderControlBar {...sourcecastControlbarProps} />
      ) : undefined}
      <Workspace {...workspaceProps} />
    </div>
  );
};

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
