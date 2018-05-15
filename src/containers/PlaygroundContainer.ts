import { connect, MapStateToProps } from 'react-redux'

import { IApplicationProps } from '../components/Application'
import { IState } from '../reducers'

import Playground from '../components/Playground'

const mapStateToProps: MapStateToProps<IState, {}, IApplicationProps> = state => ({
  application: state.application
})

export default connect(mapStateToProps)(Playground)
