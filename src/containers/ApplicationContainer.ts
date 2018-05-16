import { connect, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import Application from '../components/Application'
import { IState } from '../reducers'

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<{ title: string }, {}, IState> = state => ({
  title: state.application.title
})

export default withRouter(connect(mapStateToProps)(Application))
