import { connect, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'

import Application, { IApplicationProps } from '../components/Application'
import { IState } from '../reducers'

const mapStateToProps: MapStateToProps<IState, {}, IApplicationProps> = state => ({
  application: state.application,
  playground: state.playground
})

export default withRouter(connect(mapStateToProps)(Application))
