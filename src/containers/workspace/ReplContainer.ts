import { connect, MapStateToProps } from 'react-redux'

import Repl, { IReplProps } from '../../components/workspace/Repl'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<IReplProps, {}, IState> = state => {
  return {
    output: state.playground.output
  }
}

export default connect(mapStateToProps)(Repl)
