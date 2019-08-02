import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

import { InterpreterOutput, SideContentType } from '../../reducers/states';
import { ExternalLibraryName } from '../assessment/assessmentShape';
import Workspace, { WorkspaceProps } from '../workspace';
import { SideContentTab } from '../workspace/side-content';
import EnvVisualizer from '../workspace/side-content/EnvVisualizer';
import Inspector from '../workspace/side-content/Inspector';
import ListVisualizer from '../workspace/side-content/ListVisualizer';
import SourcecastEditor, { ISourcecastEditorProps } from './SourcecastEditor';
import { Input, IPlaybackData, KeyboardCommand, RecordingStatus } from './sourcecastShape';
import SourcereelControlbar from './SourcereelControlbar';

export interface ISourcereelProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
  breakpoints: string[];
  editorHeight?: string;
  editorReadonly: boolean;
  editorValue: string;
  editorWidth: string;
  enableDebugging: boolean;
  externalLibraryName: string;
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
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleInterruptEval: () => void;
  handleRecordInput: (input: Input) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleRecordInit: (initData: IPlaybackData['init']) => void;
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
        externalLibraryName: this.props.externalLibraryName,
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
        handleExternalSelect: ({ name }: { name: ExternalLibraryName }, e: any) => {
          this.props.handleExternalSelect(name);
          if (this.props.recordingStatus !== RecordingStatus.recording) {
            return;
          }
          this.props.handleRecordInput({
            time: this.getTimerDuration(),
            type: 'externalLibrarySelect',
            data: name
          });
        },

        handleEditorEval: () => {
          this.props.handleEditorEval();
          if (this.props.recordingStatus !== RecordingStatus.recording) {
            return;
          }
          this.props.handleRecordInput({
            time: this.getTimerDuration(),
            type: 'keyboardCommand',
            data: KeyboardCommand.run
          });
        },
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
        handleActiveTabChange: this.props.handleActiveTabChange,
        tabs: [
          {
            label: 'Introduction',
            iconName: IconNames.COMPASS,
            body: (
              <div>
                <span className="Multi-line">
                  <Pre> {INTRODUCTION} </Pre>
                </span>
                <SourcereelControlbar
                  editorValue={this.props.editorValue}
                  getTimerDuration={this.getTimerDuration}
                  playbackData={this.props.playbackData}
                  handleRecordInit={this.handleRecordInit}
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

  private handleRecordInit = () =>
    this.props.handleRecordInit({
      chapter: this.props.sourceChapter,
      externalLibrary: this.props.externalLibraryName as ExternalLibraryName,
      editorValue: this.props.editorValue
    });
}

const INTRODUCTION = 'Welcome to Sourcereel!';

const listVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <ListVisualizer />,
  id: SideContentType.dataVisualiser
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

export default Sourcereel;
