import { connect, MapStateToProps } from 'react-redux'

import Output, { IOutputProps } from '../components/Output'
import { IState } from '../reducers'

const mapStateToProps: MapStateToProps<IOutputProps, {}, IState> = state => {
  return {
    output: state.playground.output
  }
}

export default connect(mapStateToProps)(Output)
