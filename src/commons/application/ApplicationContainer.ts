import { Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginClearContext,
  changeExecTime,
  ensureLibrariesLoaded,
  externalLibrarySelect,
  promptAutocomplete,
  setEditorBreakpoint,
  updateEditorValue
} from '../workspace/WorkspaceActions';
import { logOut } from './actions/CommonsActions';
import Application, { DispatchProps, StateProps } from './Application';
import { OverallState } from './ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from './types/ExternalTypes';

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  title: state.application.title,
  accessToken: state.session.accessToken,
  role: state.session.role,
  name: state.session.name,
  currentPlaygroundChapter: state.workspaces.playground.context.chapter,
  currentPlaygroundVariant: state.workspaces.playground.context.variant,
  currentExternalLibrary: state.workspaces.playground.externalLibrary
});

const workspaceLocation = 'playground';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleClearContext: (
        chapter: number,
        variant: Variant,
        externalLibraryName: ExternalLibraryName,
        shouldInitLibrary: boolean
      ) =>
        beginClearContext(
          workspaceLocation,
          {
            chapter,
            variant,
            external: {
              name: externalLibraryName,
              symbols: externalLibraries.get(externalLibraryName)!
            },
            globals: []
          },
          shouldInitLibrary
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

const ApplicationContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));

export default ApplicationContainer;
