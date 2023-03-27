import { Chapter, Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  chapterSelect,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  updateEditorValue
} from '../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import {
  setSourcecastData,
  setSourcecastStatus
} from '../../features/sourceRecorder/SourceRecorderActions';
import { PlaybackData, PlaybackStatus } from '../../features/sourceRecorder/SourceRecorderTypes';
import Sourcecast, { DispatchProps, StateProps } from './Sourcecast';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  audioUrl: state.workspaces.sourcecast.audioUrl,
  currentPlayerTime: state.workspaces.sourcecast.currentPlayerTime,
  codeDeltasToApply: state.workspaces.sourcecast.codeDeltasToApply,
  title: state.workspaces.sourcecast.title,
  description: state.workspaces.sourcecast.description,
  externalLibraryName: state.workspaces.sourcecast.externalLibrary,
  isEditorAutorun: state.workspaces.sourcecast.isEditorAutorun,
  isEditorReadonly: state.workspaces.sourcecast.isEditorReadonly,
  inputToApply: state.workspaces.sourcecast.inputToApply,
  isRunning: state.workspaces.sourcecast.isRunning,
  isDebugging: state.workspaces.sourcecast.isDebugging,
  enableDebugging: state.workspaces.sourcecast.enableDebugging,
  output: state.workspaces.sourcecast.output,
  playbackDuration: state.workspaces.sourcecast.playbackDuration,
  playbackData: state.workspaces.sourcecast.playbackData,
  playbackStatus: state.workspaces.sourcecast.playbackStatus,
  replValue: state.workspaces.sourcecast.replValue,
  sideContentHeight: state.workspaces.sourcecast.sideContentHeight,
  sourcecastIndex: state.workspaces.sourcecast.sourcecastIndex,
  sourceChapter: state.workspaces.sourcecast.context.chapter,
  sourceVariant: state.workspaces.sourcecast.context.variant,
  uid: state.workspaces.sourcecast.uid,
  courseId: state.session.courseId
});

const location: WorkspaceLocation = 'sourcecast';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleChapterSelect: (chapter: Chapter) => chapterSelect(chapter, Variant.DEFAULT, location),
      handleEditorEval: () => evalEditor(location),
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange: (newEditorValue: string) =>
        updateEditorValue(location, 0, newEditorValue),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, location),
      handleReplEval: () => evalRepl(location),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) => setSourcecastData(title, description, uid, audioUrl, playbackData, location),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastStatus(playbackStatus, location)
    },
    dispatch
  );

const SourcecastContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Sourcecast));

export default SourcecastContainer;
