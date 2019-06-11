import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { InterpreterOutput } from '../../reducers/states';
import { ExternalLibraryName } from '../assessment/assessmentShape';
import Markdown from '../commons/Markdown';
import Workspace, { WorkspaceProps } from '../workspace';
import { SideContentTab } from '../workspace/side-content';
import EnvVisualizer from '../workspace/side-content/EnvVisualizer';
import Inspector from '../workspace/side-content/Inspector';
import ListVisualizer from '../workspace/side-content/ListVisualizer';
import { IPlaybackData, PlaybackStatus } from './sourcecastShape';

const INTRODUCTION = 'Welcome to Source Cast Playback!';

export interface ISourcecastPlaybackProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
  activeTab: number;
  editorReadonly: boolean;
  editorSessionId: string;
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  breakpoints: string[];
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  playbackDuration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
  queryString?: string;
  replValue: string;
  sideContentHeight?: number;
  sourceChapter: number;
  websocketStatus: number;
  externalLibraryName: string;
}

export interface IDispatchProps {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeActiveTab: (activeTab: number) => void;
  handleChapterSelect: (chapter: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleGenerateLz: () => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId: () => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetSourcecastPlaybackDuration: (duration: number) => void;
  handleSetSourcecastPlaybackStatus: (PlaybackStatus: PlaybackStatus) => void;
  handleSetWebsocketStatus: (websocketStatus: number) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleToggleEditorAutorun: () => void;
}

class SourcecastPlayback extends React.Component<ISourcecastPlaybackProps> {
  constructor(props: ISourcecastPlaybackProps) {
    super(props);
  }

  public render() {
    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorValue: this.props.editorValue,
        editorSessionId: this.props.editorSessionId,
        externalLibraryName: this.props.externalLibraryName,
        handleChapterSelect: ({ chapter }: { chapter: number }, e: any) =>
          this.props.handleChapterSelect(chapter),
        handleExternalSelect: ({ name }: { name: ExternalLibraryName }, e: any) =>
          this.props.handleExternalSelect(name),
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleGenerateLz: this.props.handleGenerateLz,
        handleInterruptEval: this.props.handleInterruptEval,
        handleInvalidEditorSessionId: this.props.handleInvalidEditorSessionId,
        handleReplEval: this.props.handleReplEval,
        handleReplOutputClear: this.props.handleReplOutputClear,
        handleSetEditorSessionId: this.props.handleSetEditorSessionId,
        handleToggleEditorAutorun: this.props.handleToggleEditorAutorun,
        handleDebuggerPause: this.props.handleDebuggerPause,
        handleDebuggerResume: this.props.handleDebuggerResume,
        handleDebuggerReset: this.props.handleDebuggerReset,
        hasChapterSelect: true,
        hasCollabEditing: true,
        hasEditorAutorunButton: true,
        hasSaveButton: false,
        hasShareButton: true,
        isEditorAutorun: this.props.isEditorAutorun,
        isRunning: this.props.isRunning,
        isDebugging: this.props.isDebugging,
        enableDebugging: this.props.enableDebugging,
        questionProgress: null,
        sourceChapter: this.props.sourceChapter
      },
      editorProps: {
        editorPrepend: '',
        editorPrependLines: 0,
        editorReadonly: this.props.editorReadonly,
        editorValue: this.props.editorValue,
        editorSessionId: this.props.editorSessionId,
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange,
        isEditorAutorun: this.props.isEditorAutorun,
        isPlaying: this.props.playbackStatus === PlaybackStatus.playing,
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
        activeTab: this.props.activeTab,
        handleChangeActiveTab: this.props.handleChangeActiveTab,
        tabs: [sourcecastPlaybackIntroductionTab, listVisualizerTab, inspectorTab, envVisualizerTab]
      },
      sourcecastPlaybackControlbarProps: {
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleSetEditorReadonly: this.props.handleSetEditorReadonly,
        handleSetSourcecastPlaybackDuration: this.props.handleSetSourcecastPlaybackDuration,
        handleSetSourcecastPlaybackStatus: this.props.handleSetSourcecastPlaybackStatus,
        duration: this.props.playbackDuration,
        playbackData: this.props.playbackData,
        playbackStatus: this.props.playbackStatus
      }
    };
    return (
      <div className={'SourcecastPlayback pt-dark'}>
        <Workspace {...workspaceProps} />
      </div>
    );
  }
}

const sourcecastPlaybackIntroductionTab: SideContentTab = {
  label: 'Introduction',
  icon: IconNames.COMPASS,
  body: <Markdown content={INTRODUCTION} />
};

const listVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  icon: IconNames.EYE_OPEN,
  body: <ListVisualizer />
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  icon: IconNames.SEARCH,
  body: <Inspector />
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  icon: IconNames.EYE_OPEN,
  body: <EnvVisualizer />
};

export default SourcecastPlayback;
