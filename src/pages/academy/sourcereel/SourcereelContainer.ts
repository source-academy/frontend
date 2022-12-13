import { Chapter, Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import {
  chapterSelect,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  setEditorReadonly,
  updateEditorValue
} from '../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { setSourcecastStatus } from '../../../features/sourceRecorder/SourceRecorderActions';
import {
  Input,
  PlaybackData,
  PlaybackStatus
} from '../../../features/sourceRecorder/SourceRecorderTypes';
import {
  recordInit,
  recordInput
} from '../../../features/sourceRecorder/sourcereel/SourcereelActions';
import Sourcereel, { DispatchProps, StateProps } from './Sourcereel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  audioUrl: state.workspaces.sourcecast.audioUrl,
  currentPlayerTime: state.workspaces.sourcecast.currentPlayerTime,
  codeDeltasToApply: state.workspaces.sourcecast.codeDeltasToApply,
  breakpoints: state.workspaces.sourcereel.breakpoints,
  editorReadonly: state.workspaces.sourcereel.editorReadonly,
  editorValue: state.workspaces.sourcereel.editorValue!,
  enableDebugging: state.workspaces.sourcereel.enableDebugging,
  externalLibraryName: state.workspaces.sourcereel.externalLibrary,
  highlightedLines: state.workspaces.sourcereel.highlightedLines,
  inputToApply: state.workspaces.sourcecast.inputToApply,
  isDebugging: state.workspaces.sourcereel.isDebugging,
  isEditorAutorun: state.workspaces.sourcereel.isEditorAutorun,
  isRunning: state.workspaces.sourcereel.isRunning,
  newCursorPosition: state.workspaces.sourcereel.newCursorPosition,
  output: state.workspaces.sourcereel.output,
  playbackData: state.workspaces.sourcereel.playbackData,
  playbackDuration: state.workspaces.sourcecast.playbackDuration,
  playbackStatus: state.workspaces.sourcecast.playbackStatus,
  recordingStatus: state.workspaces.sourcereel.recordingStatus,
  replValue: state.workspaces.sourcereel.replValue,
  sideContentHeight: state.workspaces.sourcereel.sideContentHeight,
  sourcecastIndex: state.workspaces.sourcecast.sourcecastIndex,
  sourceChapter: state.workspaces.sourcereel.context.chapter,
  sourceVariant: state.workspaces.sourcereel.context.variant,
  timeElapsedBeforePause: state.workspaces.sourcereel.timeElapsedBeforePause,
  timeResumed: state.workspaces.sourcereel.timeResumed,
  courseId: state.session.courseId
});

const location: WorkspaceLocation = 'sourcereel';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleChapterSelect: (chapter: Chapter) => chapterSelect(chapter, Variant.DEFAULT, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, location),
      handleRecordInput: (input: Input) => recordInput(input, location),
      handleReplEval: () => evalRepl(location),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastStatus(playbackStatus, 'sourcecast'),
      handleSetEditorReadonly: (readonly: boolean) => setEditorReadonly(location, readonly),
      handleRecordInit: (initData: PlaybackData['init']) => recordInit(initData, location)
    },
    dispatch
  );

const SourcereelContainer = connect(mapStateToProps, mapDispatchToProps)(Sourcereel);

export default SourcereelContainer;
