import { Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import {
  changeExecTime,
  chapterSelect,
  clearReplOutput,
  evalRepl,
  externalLibrarySelect,
  setEditorBreakpoint,
  toggleUsingSubst,
  updateEditorValue
} from '../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import Playground, { DispatchProps, StateProps } from '../../playground/Playground';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  ..._.pick(
    state.workspaces.sicp,
    'editorTabs',
    'programPrependValue',
    'programPostpendValue',
    'editorSessionId',
    'execTime',
    'stepLimit',
    'isEditorAutorun',
    'isRunning',
    'isDebugging',
    'enableDebugging',
    'output',
    'replValue',
    'sideContentHeight',
    'sharedbConnected',
    'usingSubst'
  ),
  queryString: state.playground.queryString,
  shortURL: state.playground.shortURL,
  playgroundSourceChapter: state.workspaces.sicp.context.chapter,
  playgroundSourceVariant: state.workspaces.sicp.context.variant,
  externalLibraryName: state.workspaces.sicp.externalLibrary,
  persistenceUser: state.session.googleUser,
  persistenceFile: state.playground.persistenceFile,
  githubOctokitObject: state.session.githubOctokitObject,
  githubSaveInfo: state.playground.githubSaveInfo
});

const workspaceLocation: WorkspaceLocation = 'sicp';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleChangeExecTime: (execTime: number) => changeExecTime(execTime, workspaceLocation),
      handleChapterSelect: (chapter: Chapter, variant: Variant) =>
        chapterSelect(chapter, variant, workspaceLocation),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName, initialise?: boolean) =>
        externalLibrarySelect(externalLibraryName, workspaceLocation, initialise),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleUsingSubst: (usingSubst: boolean) => toggleUsingSubst(usingSubst, workspaceLocation)
    },
    dispatch
  );

/**
 * Playground container for SICP snippets.
 */
const SicpWorkspaceContainer = (props: any) => {
  // FIXME: Remove any
  const Component = withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground));
  return <Component workspaceLocation={workspaceLocation} {...props} />;
};

export default SicpWorkspaceContainer;
