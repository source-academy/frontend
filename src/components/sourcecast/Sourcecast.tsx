import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';
import { InterpreterOutput, SideContentType } from '../../reducers/states';
import { ExternalLibraryName } from '../assessment/assessmentShape';
import Workspace, { WorkspaceProps } from '../workspace';
import {
  AutorunButtons,
  ChapterSelect,
  ClearButton,
  EvalButton,
  ExternalLibrarySelect
} from '../workspace/controlBar/index';
import { SideContentTab } from '../workspace/side-content';
import EnvVisualizer from '../workspace/side-content/EnvVisualizer';
import Inspector from '../workspace/side-content/Inspector';
import ListVisualizer from '../workspace/side-content/ListVisualizer';
import SourcecastControlbar, { ISourcecastControlbarProps } from './SourcecastControlbar';
import SourcecastEditor, { ISourcecastEditorProps } from './SourcecastEditor';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
  IPosition,
  ISourcecastData,
  PlaybackStatus
} from './sourcecastShape';
import SourcecastTable from './SourcecastTable';

export interface ISourcecastProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
  audioUrl: string;
  codeDeltasToApply: ICodeDelta[] | null;
  title: string | null;
  description: string | null;
  editorReadonly: boolean;
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  externalLibraryName: string;
  breakpoints: string[];
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  inputToApply: Input | null;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: IPosition;
  output: InterpreterOutput[];
  playbackDuration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
  replValue: string;
  sideContentHeight?: number;
  sourcecastIndex: ISourcecastData[] | null;
  sourceChapter: number;
  sourceVariant: Variant;
}

export interface IDispatchProps {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleDeclarationNavigate: (cursorPosition: IPosition) => void;
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
  handleSetCodeDeltasToApply: (delta: ICodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetInputToApply: (inputToApply: Input) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    audioUrl: string,
    playbackData: IPlaybackData
  ) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (PlaybackStatus: PlaybackStatus) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleToggleEditorAutorun: () => void;
}

class Sourcecast extends React.Component<ISourcecastProps> {
  constructor(props: ISourcecastProps) {
    super(props);
  }

  public componentDidUpdate(prevProps: ISourcecastProps) {
    const { inputToApply } = this.props;

    if (!inputToApply || inputToApply === prevProps.inputToApply) {
      return;
    }

    switch (inputToApply.type) {
      case 'chapterSelect':
        this.props.handleChapterSelect(inputToApply.data);
        break;
      case 'externalLibrarySelect':
        this.props.handleExternalSelect(inputToApply.data);
        break;
    }
  }

  public render() {
    const autorunButtons = (
      <AutorunButtons
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

    const chapterSelectHandler = ({ chapter }: { chapter: number }, e: any) =>
      this.props.handleChapterSelect(chapter);

    const chapterSelect = (
      <ChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={this.props.sourceChapter}
        sourceVariant={this.props.sourceVariant}
        key="chapter"
      />
    );

    const clearButton = (
      <ClearButton handleReplOutputClear={this.props.handleReplOutputClear} key="clear_repl" />
    );

    const evalButton = (
      <EvalButton
        handleReplEval={this.props.handleReplEval}
        isRunning={this.props.isRunning}
        key="eval_repl"
      />
    );

    const externalSelectHandler = ({ name }: { name: ExternalLibraryName }, e: any) =>
      this.props.handleExternalSelect(name);

    const externalLibrarySelect = (
      <ExternalLibrarySelect
        externalLibraryName={this.props.externalLibraryName}
        handleExternalSelect={externalSelectHandler}
        key="external_library"
      />
    );

    const editorProps: ISourcecastEditorProps = {
      codeDeltasToApply: this.props.codeDeltasToApply,
      editorReadonly: this.props.editorReadonly,
      editorValue: this.props.editorValue,
      editorSessionId: '',
      handleDeclarationNavigate: this.props.handleDeclarationNavigate,
      handleEditorEval: this.props.handleEditorEval,
      handleEditorValueChange: this.props.handleEditorValueChange,
      isEditorAutorun: this.props.isEditorAutorun,
      inputToApply: this.props.inputToApply,
      isPlaying: this.props.playbackStatus === PlaybackStatus.playing,
      breakpoints: this.props.breakpoints,
      highlightedLines: this.props.highlightedLines,
      newCursorPosition: this.props.newCursorPosition,
      handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints
    };
    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        editorButtons: [autorunButtons, chapterSelect, externalLibrarySelect],
        replButtons: [evalButton, clearButton]
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
                  <Pre>
                    {this.props.title
                      ? 'Title: ' + this.props.title + '\nDescription: ' + this.props.description
                      : INTRODUCTION}
                  </Pre>
                </span>
                <SourcecastTable
                  handleFetchSourcecastIndex={this.props.handleFetchSourcecastIndex}
                  handleSetSourcecastData={this.props.handleSetSourcecastData}
                  sourcecastIndex={this.props.sourcecastIndex}
                />
              </div>
            ),
            id: SideContentType.introduction
          },
          listVisualizerTab,
          inspectorTab,
          envVisualizerTab
        ]
      }
    };
    const sourcecastControlbarProps: ISourcecastControlbarProps = {
      handleEditorValueChange: this.props.handleEditorValueChange,
      handlePromptAutocomplete: this.props.handlePromptAutocomplete,
      handleSetCodeDeltasToApply: this.props.handleSetCodeDeltasToApply,
      handleSetEditorReadonly: this.props.handleSetEditorReadonly,
      handleSetInputToApply: this.props.handleSetInputToApply,
      handleSetSourcecastDuration: this.props.handleSetSourcecastDuration,
      handleSetSourcecastStatus: this.props.handleSetSourcecastStatus,
      audioUrl: this.props.audioUrl,
      duration: this.props.playbackDuration,
      playbackData: this.props.playbackData,
      playbackStatus: this.props.playbackStatus,
      handleChapterSelect: this.props.handleChapterSelect,
      handleExternalSelect: this.props.handleExternalSelect
    };
    return (
      <div className={classNames('Sourcecast', Classes.DARK)}>
        <SourcecastControlbar {...sourcecastControlbarProps} />
        <Workspace {...workspaceProps} />
      </div>
    );
  }
}

const INTRODUCTION = 'Welcome to Sourcecast!';

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

export default Sourcecast;
