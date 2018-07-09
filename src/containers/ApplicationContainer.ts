import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { changeChapter, updateEditorValue } from '../actions'
import Application, { IDispatchProps } from '../components/Application'
import { IState } from '../reducers/states'

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<{ title: string }, {}, IState> = state => ({
  title: state.application.title,
  accessToken: state.session.accessToken,
  role: state.session.role,
  username: state.session.username
})

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChangeChapter: (chapter: number) => changeChapter(chapter, 'playground'),
      handleEditorValueChange: (val: string) => updateEditorValue(val, 'playground')
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application))
