import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

import { InterpreterOutput } from '../../reducers/states';
import Workspace, { WorkspaceProps } from '../workspace';
import { SideContentTab } from '../workspace/side-content';
import EnvVisualizer from '../workspace/side-content/EnvVisualizer';
import Inspector from '../workspace/side-content/Inspector';
import ListVisualizer from '../workspace/side-content/ListVisualizer';
import SourcecastEditor, { ISourcecastEditorProps } from './SourcecastEditor';
import { Input, IPlaybackData, RecordingStatus } from './sourcecastShape';
import SourcereelControlbar from './SourcereelControlbar';

export interface ISourcereelProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
  activeTab: number;
  breakpoints: string[];
  editorHeight?: string;
  editorReadonly: boolean;
  editorValue: string;
  editorWidth: string;
  enableDebugging: boolean;
  highlightedLines: number[][];
  isDebugging: boolean;
  isEditorAutorun: boolean;
  isRunning: boolean;
  output: InterpreterOutput[];
  playbackData: IPlaybackData;
  recordingStatus: RecordingStatus;
  replValue: string;
  timeElapsedBeforePause: number;
  sideContentHeight?: number;
  sourceChapter: number;
  timeResumed: number;
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
  handleInterruptEval: () => void;
  handleRecordInput: (input: Input) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleRecordEditorInitValue: (editorValue: string) => void;
  handleSaveSourcecastData: (
    title: string,
    description: string,
    audio: Blob,
    playbackData: IPlaybackData
  ) => void;
  handleSetEditorReadonly: (readonly: boolean) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTimerPause: () => void;
  handleTimerReset: () => void;
  handleTimerResume: () => void;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  handleToggleEditorAutorun: () => void;
}

class Sourcereel extends React.Component<ISourcereelProps> {
  constructor(props: ISourcereelProps) {
    super(props);
  }

  public render() {
    const editorProps: ISourcecastEditorProps = {
      editorReadonly: this.props.editorReadonly,
      editorValue: this.props.editorValue,
      editorSessionId: '',
      getTimerDuration: this.getTimerDuration,
      handleEditorEval: this.props.handleEditorEval,
      handleEditorValueChange: this.props.handleEditorValueChange,
      isEditorAutorun: this.props.isEditorAutorun,
      isRecording: this.props.recordingStatus === RecordingStatus.recording,
      breakpoints: this.props.breakpoints,
      highlightedLines: this.props.highlightedLines,
      handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
      handleRecordInput: this.props.handleRecordInput
    };
    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorValue: this.props.editorValue,
        handleChapterSelect: ({ chapter }: { chapter: number }, e: any) => {
          this.props.handleChapterSelect(chapter);
          if (this.props.recordingStatus !== RecordingStatus.recording) {
            return;
          }
          this.props.handleRecordInput({
            time: this.getTimerDuration(),
            type: 'chapterSelect',
            data: chapter
          });
        },
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange,
        handleInterruptEval: this.props.handleInterruptEval,
        handleReplEval: this.props.handleReplEval,
        handleReplOutputClear: this.props.handleReplOutputClear,
        handleToggleEditorAutorun: this.props.handleToggleEditorAutorun,
        handleDebuggerPause: this.props.handleDebuggerPause,
        handleDebuggerResume: this.props.handleDebuggerResume,
        handleDebuggerReset: this.props.handleDebuggerReset,
        hasChapterSelect: true,
        hasCollabEditing: false,
        hasEditorAutorunButton: true,
        hasSaveButton: false,
        hasShareButton: false,
        isEditorAutorun: this.props.isEditorAutorun,
        isRunning: this.props.isRunning,
        isDebugging: this.props.isDebugging,
        enableDebugging: this.props.enableDebugging,
        questionProgress: null,
        sourceChapter: this.props.sourceChapter
      },
      customEditor: <SourcecastEditor {...editorProps} />,
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
                <span className="Multi-line">
                  <Pre> {INTRODUCTION} </Pre>
                </span>
                <SourcereelControlbar
                  editorValue={this.props.editorValue}
                  getTimerDuration={this.getTimerDuration}
                  playbackData={this.props.playbackData}
                  handleRecordEditorInitValue={this.props.handleRecordEditorInitValue}
                  handleSaveSourcecastData={this.props.handleSaveSourcecastData}
                  handleSetEditorReadonly={this.props.handleSetEditorReadonly}
                  handleTimerPause={this.props.handleTimerPause}
                  handleTimerReset={this.props.handleTimerReset}
                  handleTimerResume={this.props.handleTimerResume}
                  handleTimerStart={this.props.handleTimerStart}
                  handleTimerStop={this.props.handleTimerStop}
                  recordingStatus={this.props.recordingStatus}
                />
              </div>
            )
          },
          listVisualizerTab,
          inspectorTab,
          envVisualizerTab
        ]
      }
    };
    return (
      <div className={classNames('Sourcereel', Classes.DARK)}>
        <Workspace {...workspaceProps} />
      </div>
    );
  }

  public getTimerDuration = () =>
    this.props.timeElapsedBeforePause + Date.now() - this.props.timeResumed;
}

const INTRODUCTION = 'Welcome to Sourcereel!';

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

export default Sourcereel;
