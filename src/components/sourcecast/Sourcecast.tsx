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
import {
  ICodeDelta,
  IPlaybackData,
  IPosition,
  ISelectionData,
  PlaybackStatus
} from './sourcecastShape';
import SourcecastTable from './SourcecastTable';

export interface ISourcecastProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
  activeTab: number;
  audioUrl: string;
  codeDeltasToApply: ICodeDelta[] | null;
  title: string | null;
  description: string | null;
  editorCursorPositionToBeApplied: IPosition;
  editorSelectionDataToBeApplied: ISelectionData;
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
  sourcecastIndex: any;
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
  handleFetchSourcecastIndex: () => void;
  handleGenerateLz: () => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId: () => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleRecordAudioUrl: (audioUrl: string) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSetCodeDeltasToApply: (delta: ICodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    playbackData: IPlaybackData
  ) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
  handleSetWebsocketStatus: (websocketStatus: number) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleToggleEditorAutorun: () => void;
  handleUpdateEditorCursorPosition: (editorCursorPositionToBeApplied: IPosition) => void;
  handleUpdateEditorSelectionData: (editorSelectionDataToBeApplied: ISelectionData) => void;
}

class Sourcecast extends React.Component<ISourcecastProps> {
  constructor(props: ISourcecastProps) {
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
        codeDeltasToApply: this.props.codeDeltasToApply,
        editorCursorPositionToBeApplied: this.props.editorCursorPositionToBeApplied,
        editorSelectionDataToBeApplied: this.props.editorSelectionDataToBeApplied,
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
        tabs: [
          {
            label: 'Introduction',
            icon: IconNames.COMPASS,
            body: (
              <div>
                <Markdown
                  content={
                    this.props.title
                      ? 'Title: ' + this.props.title + '\nDescription: ' + this.props.description
                      : INTRODUCTION
                  }
                />
                <SourcecastTable
                  handleFetchSourcecastIndex={this.props.handleFetchSourcecastIndex}
                  handleRecordAudioUrl={this.props.handleRecordAudioUrl}
                  handleSetSourcecastData={this.props.handleSetSourcecastData}
                  sourcecastIndex={this.props.sourcecastIndex}
                />
              </div>
            )
          },
          listVisualizerTab,
          inspectorTab,
          envVisualizerTab
        ]
      },
      sourcecastControlbarProps: {
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleSetCodeDeltasToApply: this.props.handleSetCodeDeltasToApply,
        handleSetEditorReadonly: this.props.handleSetEditorReadonly,
        handleSetSourcecastDuration: this.props.handleSetSourcecastDuration,
        handleSetSourcecastStatus: this.props.handleSetSourcecastStatus,
        handleUpdateEditorCursorPosition: this.props.handleUpdateEditorCursorPosition,
        handleUpdateEditorSelectionData: this.props.handleUpdateEditorSelectionData,
        audioUrl: this.props.audioUrl,
        duration: this.props.playbackDuration,
        playbackData: this.props.playbackData,
        playbackStatus: this.props.playbackStatus
      }
    };
    return (
      <div className={'Sourcecast pt-dark'}>
        <Workspace {...workspaceProps} />
      </div>
    );
  }
}

const INTRODUCTION = 'Welcome to Sourcecast!';

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
  icon: IconNames.GLOBE,
  body: <EnvVisualizer />
};

export default Sourcecast;
