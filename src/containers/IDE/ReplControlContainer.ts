import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { clearReplOutput, evalEditor, evalRepl } from '../../actions/playground'
import ReplControl, { IReplControlProps } from '../../components/IDE/ReplControl'
import { IState } from '../../reducers/states'

type DispatchProps = Pick<IReplControlProps, 'handleEvalRepl'> &
  Pick<IReplControlProps, 'handleClearReplOutput'>

/** No-op mapStateToProps */
const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({})

/** Provides a callback function `handleEvalEditor`
 *  to evaluate code in the Editor.
 */
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalEditor: evalEditor,
      handleEvalRepl: evalRepl,
      handleClearReplOutput: clearReplOutput
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ReplControl)
