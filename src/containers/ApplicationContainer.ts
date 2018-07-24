import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { clearContext, updateEditorValue } from '../actions'
import { WorkspaceLocations } from '../actions/workspaces'
import Application, { IDispatchProps, IStateProps } from '../components/Application'
import { ExternalLibraryNames } from '../components/assessment/assessmentShape'
import { IState } from '../reducers/states'

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  title: state.application.title,
  accessToken: state.session.accessToken,
  role: state.session.role,
  username: state.session.username,
  currentPlaygroundChapter: state.workspaces.playground.context.chapter,
  currentPlaygroundExternals: state.workspaces.playground.externals
})

const workspaceLocation = WorkspaceLocations.playground

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      /**
       * Note that an empty globals is passed (as this is never used in URLs)
       * and that ExternalLibraryNames.NONE is used (as URL library support is not ready yet).
       */
      handleClearContext: (chapter: number, symbols: string[]) =>
      clearContext({
        chapter,
        external: {
          name: ExternalLibraryNames.NONE,
          symbols
        },
        globals: []
        }, workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation)
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application))
