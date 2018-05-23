import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { handleInterruptExecution } from '../../actions/interpreter'
import { clearReplOutput, evalEditor, evalRepl } from '../../actions/playground'
import Control, { IControlProps } from '../../components/IDE/Control'
import { IState } from '../../reducers/states'

type StateProps = Pick<IControlProps, 'isRunning'>

type DispatchProps = Pick<IControlProps, 'handleEvalEditor'> &
  Pick<IControlProps, 'handleEvalRepl'> &
  Pick<IControlProps, 'handleClearReplOutput'> &
  Pick<IControlProps, 'handleInterruptEval'>

/** No-op mapStateToProps */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  isRunning: state.playground.isRunning
})

/** Provides a callback function `handleEvalEditor`
 *  to evaluate code in the Editor.
 */
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalEditor: evalEditor,
      handleEvalRepl: evalRepl,
      handleClearReplOutput: clearReplOutput,
      handleInterruptEval: handleInterruptExecution
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Control)
