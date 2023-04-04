import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from 'src/commons/application/actions/InterpreterActions';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  clearReplOutput,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  setEditorBreakpoint,
  setIsEditorReadonly,
  toggleEditorAutorun,
  updateActiveEditorTabIndex,
  updateReplValue
} from 'src/commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { fetchSourcecastIndex } from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import {
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastDuration
} from 'src/features/sourceRecorder/SourceRecorderActions';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import {
  convertEditorTabStateToProps,
  SourcecastEditorContainerProps
} from '../../commons/editor/EditorContainer';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import SideContentDataVisualizer from '../../commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../commons/sideContent/SideContentEnvVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../commons/sourceRecorder/SourceRecorderControlBar';
import SourceRecorderTable from '../../commons/sourceRecorder/SourceRecorderTable';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SourcecastData
} from '../../features/sourceRecorder/SourceRecorderTypes';

export type SourcecastProps = DispatchProps &
  StateProps &
  RouteComponentProps<{ sourcecastId: string }>;

export type DispatchProps = {
  handleChapterSelect: (chapter: Chapter) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (newEditorValue: string) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleReplEval: () => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
};

export type StateProps = {
  audioUrl: string;
  currentPlayerTime: number;
  codeDeltasToApply: CodeDelta[] | null;
  title: string | null;
  description: string | null;
  externalLibraryName: ExternalLibraryName;
  isEditorAutorun: boolean;
  isEditorReadonly: boolean;
  inputToApply: Input | null;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  playbackDuration: number;
  playbackData: PlaybackData;
  playbackStatus: PlaybackStatus;
  replValue: string;
  sideContentHeight?: number;
  sourcecastIndex: SourcecastData[] | null;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  uid: string | null;
  courseId?: number;
};

const workspaceLocation: WorkspaceLocation = 'sourcecast';

const Sourcecast: React.FC<SourcecastProps> = props => {
  const { isMobileBreakpoint } = useResponsive();

  const dispatch = useDispatch();

  const { isFolderModeEnabled, activeEditorTabIndex, editorTabs } = useTypedSelector(
    store => store.workspaces[workspaceLocation]
  );

  /**
   * The default selected tab for the Sourcecast workspace is the introduction tab,
   * which contains the ag-grid table of available Sourcecasts. This is intentional
   * to avoid an ag-grid console warning. For more info, see issue #1152 in frontend.
   */
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.introduction);

  const handleQueryParam = React.useCallback(() => {
    const newUid = props.match.params.sourcecastId;
    if (newUid && newUid !== props.uid && props.sourcecastIndex) {
      const cast = props.sourcecastIndex.find(data => data.uid === newUid);
      if (cast) {
        props.handleSetSourcecastData(
          cast.title,
          cast.description,
          cast.uid,
          cast.url,
          JSON.parse(cast.playbackData)
        );
      }
    }
  }, [props]);

  React.useEffect(() => {
    dispatch(fetchSourcecastIndex(workspaceLocation));
    // This effect should only fire once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    handleQueryParam();

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
    // This effect should only fire when props.inputToApply changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleQueryParam, props.inputToApply]);

  /**
   * Handles toggling of relevant SideContentTabs when exiting the mobile breakpoint
   */
  React.useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={() => dispatch(beginDebuggerPause(workspaceLocation))}
      handleDebuggerReset={() => dispatch(debuggerReset(workspaceLocation))}
      handleDebuggerResume={() => dispatch(debuggerResume(workspaceLocation))}
      handleEditorEval={props.handleEditorEval}
      handleInterruptEval={() => dispatch(beginInterruptExecution(workspaceLocation))}
      handleToggleEditorAutorun={() => dispatch(toggleEditorAutorun(workspaceLocation))}
      isEntrypointFileDefined={activeEditorTabIndex !== null}
      isDebugging={props.isDebugging}
      isEditorAutorun={props.isEditorAutorun}
      isRunning={props.isRunning}
      key="autorun"
    />
  );

  const chapterSelectHandler = ({ chapter }: { chapter: Chapter }, e: any) =>
    props.handleChapterSelect(chapter);

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

  const tabs: SideContentTab[] = [
    {
      label: 'Sourcecast Table',
      iconName: IconNames.HOME,
      body: (
        <div>
          <span className="Multi-line">
            <Pre>
              {props.title
                ? 'Title: ' + props.title + '\nDescription: ' + props.description
                : INTRODUCTION}
            </Pre>
          </span>
          <SourceRecorderTable
            handleSetSourcecastData={props.handleSetSourcecastData}
            sourcecastIndex={props.sourcecastIndex}
            courseId={props.courseId}
          />
        </div>
      ),
      id: SideContentType.introduction
    },
    dataVisualizerTab,
    envVisualizerTab
  ];

  const onChangeTabs = (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (newTabId === prevTabId) {
      return;
    }
    setSelectedTab(newTabId);
  };

  const setActiveEditorTabIndex = React.useCallback(
    (activeEditorTabIndex: number | null) =>
      dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
    [dispatch]
  );
  const removeEditorTabByIndex = React.useCallback(
    (editorTabIndex: number) => dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
    [dispatch]
  );

  const editorContainerProps: SourcecastEditorContainerProps = {
    editorVariant: 'sourcecast',
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    codeDeltasToApply: props.codeDeltasToApply,
    isEditorReadonly: props.isEditorReadonly,
    editorSessionId: '',
    handleDeclarationNavigate: cursorPosition =>
      dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: props.handleEditorValueChange,
    isEditorAutorun: props.isEditorAutorun,
    inputToApply: props.inputToApply,
    isPlaying: props.playbackStatus === PlaybackStatus.playing,
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorUpdateBreakpoints: newBreakpoints =>
      dispatch(setEditorBreakpoint(workspaceLocation, 0, newBreakpoints))
  };

  const replProps = {
    output: props.output,
    replValue: props.replValue,
    handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
    handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
    handleReplEval: props.handleReplEval,
    handleReplValueChange: (newValue: string) =>
      dispatch(updateReplValue(newValue, workspaceLocation)),
    sourceChapter: props.sourceChapter,
    sourceVariant: props.sourceVariant,
    externalLibrary: props.externalLibraryName,
    replButtons: [evalButton, clearButton]
  };

  const sideBarProps = {
    tabs: []
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelect]
    },
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: change =>
      dispatch(changeSideContentHeight(change, workspaceLocation)),
    replProps: replProps,
    sideBarProps: sideBarProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: 'sourcecast',
      sideContentHeight: props.sideContentHeight
    }
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps: editorContainerProps,
    replProps: replProps,
    sideBarProps: sideBarProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelect]
      },
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: 'sourcecast'
    }
  };

  const sourcecastControlbarProps: SourceRecorderControlBarProps = {
    handleEditorValueChange: props.handleEditorValueChange,
    handlePromptAutocomplete: (row, col, callback) =>
      dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
    handleSetCurrentPlayerTime: (playerTime: number) =>
      dispatch(setCurrentPlayerTime(playerTime, workspaceLocation)),
    handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
      dispatch(setCodeDeltasToApply(deltas, workspaceLocation)),
    handleSetIsEditorReadonly: (editorReadonly: boolean) =>
      dispatch(setIsEditorReadonly(workspaceLocation, editorReadonly)),
    handleSetInputToApply: inputToApply =>
      dispatch(setInputToApply(inputToApply, workspaceLocation)),
    handleSetSourcecastDuration: (duration: number) =>
      dispatch(setSourcecastDuration(duration, workspaceLocation)),
    handleSetSourcecastStatus: props.handleSetSourcecastStatus,
    audioUrl: props.audioUrl,
    currentPlayerTime: props.currentPlayerTime,
    duration: props.playbackDuration,
    playbackData: props.playbackData,
    playbackStatus: props.playbackStatus,
    handleChapterSelect: props.handleChapterSelect,
    handleExternalSelect: props.handleExternalSelect,
    setSelectedTab: setSelectedTab
  };

  return (
    <div className={classNames('Sourcecast', Classes.DARK)}>
      <SourceRecorderControlBar {...sourcecastControlbarProps} />
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
};

const INTRODUCTION = 'Welcome to Sourcecast!';

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

export default Sourcecast;
