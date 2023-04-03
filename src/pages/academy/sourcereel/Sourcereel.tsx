import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from 'src/commons/application/actions/InterpreterActions';
import { fetchSourcecastIndex } from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration
} from 'src/features/sourceRecorder/SourceRecorderActions';
import {
  deleteSourcecastEntry,
  recordInit,
  resetInputs,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop
} from 'src/features/sourceRecorder/sourcereel/SourcereelActions';

import { InterpreterOutput } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../commons/controlBar/ControlBarEvalButton';
import {
  convertEditorTabStateToProps,
  SourcecastEditorContainerProps
} from '../../../commons/editor/EditorContainer';
import SideContentDataVisualizer from '../../../commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../../commons/sideContent/SideContentEnvVisualizer';
import { SideContentTab, SideContentType } from '../../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../../commons/sourceRecorder/SourceRecorderControlBar';
import SourcecastTable from '../../../commons/sourceRecorder/SourceRecorderTable';
import { useTypedSelector } from '../../../commons/utils/Hooks';
import Workspace, { WorkspaceProps } from '../../../commons/workspace/Workspace';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  clearReplOutput,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  setEditorBreakpoint,
  toggleEditorAutorun,
  updateActiveEditorTabIndex,
  updateReplValue
} from '../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
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
  handleChapterSelect: (chapter: Chapter) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (newEditorValue: string) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleRecordInput: (input: Input) => void;
  handleReplEval: () => void;
  handleSetIsEditorReadonly: (editorReadonly: boolean) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
};

export type StateProps = {
  audioUrl: string;
  currentPlayerTime: number;
  codeDeltasToApply: CodeDelta[] | null;
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

const workspaceLocation: WorkspaceLocation = 'sourcereel';

const Sourcereel: React.FC<SourcereelProps> = props => {
  const [selectedTab, setSelectedTab] = useState(SideContentType.sourcereel);
  const dispatch = useDispatch();

  const { isFolderModeEnabled, activeEditorTabIndex, editorTabs } = useTypedSelector(
    store => store.workspaces[workspaceLocation]
  );

  useEffect(() => {
    fetchSourcecastIndex('sourcecast');
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.inputToApply]);

  const setActiveEditorTabIndex = React.useCallback(
    (activeEditorTabIndex: number | null) =>
      dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
    [dispatch]
  );
  const removeEditorTabByIndex = React.useCallback(
    (editorTabIndex: number) => dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
    [dispatch]
  );

  const getTimerDuration = () => props.timeElapsedBeforePause + Date.now() - props.timeResumed;

  const handleRecordInit = () => {
    const initData: PlaybackData['init'] = {
      chapter: props.sourceChapter,
      externalLibrary: props.externalLibraryName as ExternalLibraryName,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: editorTabs[0].value
    };
    dispatch(recordInit(initData, workspaceLocation));
  };

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
      handleDebuggerPause={() => dispatch(beginDebuggerPause(workspaceLocation))}
      handleDebuggerResume={() => dispatch(debuggerResume(workspaceLocation))}
      handleDebuggerReset={() => dispatch(debuggerReset(workspaceLocation))}
      handleEditorEval={editorEvalHandler}
      handleInterruptEval={() => dispatch(beginInterruptExecution(workspaceLocation))}
      handleToggleEditorAutorun={() => dispatch(toggleEditorAutorun(workspaceLocation))}
      isEntrypointFileDefined={activeEditorTabIndex !== null}
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
      isFolderModeEnabled={isFolderModeEnabled}
      sourceChapter={props.sourceChapter}
      sourceVariant={props.sourceVariant}
      key="chapter"
    />
  );

  const clearButton = (
    <ControlBarClearButton
      handleReplOutputClear={() => dispatch(clearReplOutput(workspaceLocation))}
      key="clear_repl"
    />
  );

  const evalButton = (
    <ControlBarEvalButton
      handleReplEval={props.handleReplEval}
      isRunning={props.isRunning}
      key="eval_repl"
    />
  );

  const editorContainerProps: SourcecastEditorContainerProps = {
    ..._.pick(
      props,
      'codeDeltasToApply',
      'handleEditorEval',
      'handleEditorValueChange',
      'isEditorAutorun',
      'inputToApply',
      'handleRecordInput',
      'isEditorReadonly'
    ),
    editorVariant: 'sourcecast',
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    handleDeclarationNavigate: cursorPosition =>
      dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorUpdateBreakpoints: newBreakpoints =>
      dispatch(setEditorBreakpoint(workspaceLocation, 0, newBreakpoints)),
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
      editorButtons: [autorunButtons, chapterSelect]
    },
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: heightChange =>
      dispatch(changeSideContentHeight(heightChange, workspaceLocation)),
    replProps: {
      output: props.output,
      replValue: props.replValue,
      handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
      handleReplEval: props.handleReplEval,
      handleReplValueChange: newValue => dispatch(updateReplValue(newValue, workspaceLocation)),
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
                  // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
                  editorValue={editorTabs[0].value}
                  getTimerDuration={getTimerDuration}
                  playbackData={props.playbackData}
                  handleRecordInit={handleRecordInit}
                  handleRecordPause={handleRecordPause}
                  handleResetInputs={(inputs: Input[]) =>
                    dispatch(resetInputs(inputs, workspaceLocation))
                  }
                  handleSaveSourcecastData={(title, description, uid, audio, playbackData) =>
                    dispatch(
                      saveSourcecastData(title, description, uid, audio, playbackData, 'sourcecast')
                    )
                  }
                  handleSetSourcecastData={(title, description, uid, audioUrl, playbackData) =>
                    dispatch(
                      setSourcecastData(
                        title,
                        description,
                        uid,
                        audioUrl,
                        playbackData,
                        'sourcecast'
                      )
                    )
                  }
                  handleSetIsEditorReadonly={props.handleSetIsEditorReadonly}
                  handleTimerPause={() => dispatch(timerPause(workspaceLocation))}
                  handleTimerReset={() => dispatch(timerReset(workspaceLocation))}
                  handleTimerResume={timeBefore =>
                    dispatch(timerResume(timeBefore, workspaceLocation))
                  }
                  handleTimerStart={() => dispatch(timerStart(workspaceLocation))}
                  handleTimerStop={() => dispatch(timerStop(workspaceLocation))}
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
                  handleDeleteSourcecastEntry={id =>
                    dispatch(deleteSourcecastEntry(id, 'sourcecast'))
                  }
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
      'handleSetIsEditorReadonly',
      'handleSetSourcecastStatus',
      'audioUrl',
      'currentPlayerTime',
      'playbackData',
      'playbackStatus',
      'handleChapterSelect',
      'handleExternalSelect'
    ),
    handleSetCurrentPlayerTime: playerTime =>
      dispatch(setCurrentPlayerTime(playerTime, 'sourcecast')),
    handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
      dispatch(setCodeDeltasToApply(deltas, 'sourcecast')),
    handleSetInputToApply: (inputToApply: Input) =>
      dispatch(setInputToApply(inputToApply, 'sourcecast')),
    handleSetSourcecastDuration: duration =>
      dispatch(setSourcecastDuration(duration, 'sourcecast')),
    handlePromptAutocomplete: (row, col, callback) =>
      dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
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
