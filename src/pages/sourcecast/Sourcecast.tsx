import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';
import MobileWorkspace, { MobileWorkspaceProps } from 'src/commons/mobileWorkspace/MobileWorkspace';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExternalLibrarySelect } from '../../commons/controlBar/ControlBarExternalLibrarySelect';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import SideContentEnvVisualizer from '../../commons/sideContent/SideContentEnvVisualizer';
import SideContentInspector from '../../commons/sideContent/SideContentInspector';
import SideContentListVisualizer from '../../commons/sideContent/SideContentListVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../commons/sourceRecorder/SourceRecorderControlBar';
import SourceRecorderEditor, {
  SourceRecorderEditorProps
} from '../../commons/sourceRecorder/SourceRecorderEditor';
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
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleFetchSourcecastIndex: () => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSetCurrentPlayerTime: (playTime: number) => void;
  handleSetCodeDeltasToApply: (delta: CodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetInputToApply: (inputToApply: Input) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleToggleEditorAutorun: () => void;
};

export type StateProps = {
  audioUrl: string;
  currentPlayerTime: number;
  codeDeltasToApply: CodeDelta[] | null;
  title: string | null;
  description: string | null;
  editorReadonly: boolean;
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  externalLibraryName: ExternalLibraryName;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  isEditorAutorun: boolean;
  inputToApply: Input | null;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  playbackDuration: number;
  playbackData: PlaybackData;
  playbackStatus: PlaybackStatus;
  replValue: string;
  sideContentActiveTab: SideContentType;
  sideContentHeight?: number;
  sourcecastIndex: SourcecastData[] | null;
  sourceChapter: number;
  sourceVariant: Variant;
  uid: string | null;
};

const Sourcecast: React.FC<SourcecastProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: 768 });
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
    props.handleFetchSourcecastIndex();
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
        props.handleActiveTabChange(inputToApply.data);
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
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={props.handleDebuggerPause}
      handleDebuggerReset={props.handleDebuggerReset}
      handleDebuggerResume={props.handleDebuggerResume}
      handleEditorEval={props.handleEditorEval}
      handleInterruptEval={props.handleInterruptEval}
      handleToggleEditorAutorun={props.handleToggleEditorAutorun}
      isDebugging={props.isDebugging}
      isEditorAutorun={props.isEditorAutorun}
      isRunning={props.isRunning}
      key="autorun"
    />
  );

  const chapterSelectHandler = ({ chapter }: { chapter: number }, e: any) =>
    props.handleChapterSelect(chapter);

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

  const externalSelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) =>
    props.handleExternalSelect(name);

  const externalLibrarySelect = (
    <ControlBarExternalLibrarySelect
      externalLibraryName={props.externalLibraryName}
      handleExternalSelect={externalSelectHandler}
      key="external_library"
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
          />
        </div>
      ),
      id: SideContentType.introduction,
      toSpawn: () => true
    },
    listVisualizerTab,
    inspectorTab,
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

  const editorProps: SourceRecorderEditorProps = {
    codeDeltasToApply: props.codeDeltasToApply,
    editorReadonly: props.editorReadonly,
    editorValue: props.editorValue,
    editorSessionId: '',
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: props.handleEditorValueChange,
    isEditorAutorun: props.isEditorAutorun,
    inputToApply: props.inputToApply,
    isPlaying: props.playbackStatus === PlaybackStatus.playing,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints
  };

  const replProps = {
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
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelect, externalLibrarySelect]
    },
    customEditor: (ref?: React.RefObject<ReactAce>) => (
      <SourceRecorderEditor {...editorProps} forwardedRef={ref} />
    ),
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    replProps: replProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      handleActiveTabChange: props.handleActiveTabChange,
      // selectedTabId: props.sideContentActiveTab,
      selectedTabId: selectedTab, // track selectedTab in this component instead of Redux store
      onChange: onChangeTabs,
      tabs: tabs,
      workspaceLocation: 'sourcecast'
    }
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    customEditor: (ref?: React.RefObject<ReactAce>) => (
      <SourceRecorderEditor {...editorProps} forwardedRef={ref} />
    ),
    replProps: replProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelect, externalLibrarySelect]
      },
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs: tabs,
      workspaceLocation: 'sourcecast',
      handleEditorEval: props.handleEditorEval
    }
  };

  const sourcecastControlbarProps: SourceRecorderControlBarProps = {
    handleEditorValueChange: props.handleEditorValueChange,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    handleSetCurrentPlayerTime: props.handleSetCurrentPlayerTime,
    handleSetCodeDeltasToApply: props.handleSetCodeDeltasToApply,
    handleSetEditorReadonly: props.handleSetEditorReadonly,
    handleSetInputToApply: props.handleSetInputToApply,
    handleSetSourcecastDuration: props.handleSetSourcecastDuration,
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

const listVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentListVisualizer />,
  id: SideContentType.dataVisualiser,
  toSpawn: () => true
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  iconName: IconNames.SEARCH,
  body: <SideContentInspector />,
  id: SideContentType.inspector,
  toSpawn: () => true
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualiser,
  toSpawn: () => true
};

export default Sourcecast;
