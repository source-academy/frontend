import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { clearReplOutput, evalEditor, evalRepl } from '../../actions/playground'
import Control, { IControlProps } from '../../components/IDE/Control'
import { IState } from '../../reducers/states'

type DispatchProps = Pick<IControlProps, 'handleEvalEditor'> &
  Pick<IControlProps, 'handleEvalRepl'> &
  Pick<IControlProps, 'handleClearReplOutput'>

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

export default connect(mapStateToProps, mapDispatchToProps)(Control)
