import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { Variant } from 'js-slang/dist/types';

import { logOut } from 'src/commons/application/actions/CommonsActions';
import { ExternalLibraryName } from 'src/commons/assessment/AssessmentTypes';
import {
  beginClearContext,
  changeExecTime,
  ensureLibrariesLoaded,
  externalLibrarySelect,
  promptAutocomplete,
  setEditorBreakpoint,
  updateEditorValue, 
  WorkspaceLocations
} from 'src/commons/workspace/WorkspaceActions';
import { externalLibraries } from 'src/reducers/externalLibraries';
import { IState } from 'src/commons/types/ApplicationTypes';

import Application, { DispatchProps, StateProps } from './ApplicationComponent';

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  title: state.application.title,
  accessToken: state.session.accessToken,
  role: state.session.role,
  name: state.session.name,
  currentPlaygroundChapter: state.workspaces.playground.context.chapter,
  currentPlaygroundVariant: state.workspaces.playground.context.variant,
  currentExternalLibrary: state.workspaces.playground.externalLibrary
});

const workspaceLocation = WorkspaceLocations.playground;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleClearContext: (
        chapter: number,
        variant: Variant,
        externalLibraryName: ExternalLibraryName
      ) =>
        beginClearContext(
          {
            chapter,
            variant,
            external: {
              name: externalLibraryName,
              symbols: externalLibraries.get(externalLibraryName)!
            },
            globals: []
          },
          workspaceLocation
        ),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleEnsureLibrariesLoaded: ensureLibrariesLoaded,
      handleLogOut: logOut,
      handleExternalLibrarySelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, workspaceLocation),
      handleSetExecTime: (execTime: string) => changeExecTime(execTime, workspaceLocation)
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Application)
);
