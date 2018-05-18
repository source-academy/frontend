import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalEditor } from '../../actions/playground'
import Control, { IControlProps } from '../../components/IDE/Control'
import { IState } from '../../reducers/states'

type DispatchProps = Pick<IControlProps, 'handleEvalEditor'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({})

/** Provides a callback function `handleEvalEditor`
 * to evaluate code in the Editor.
 */
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalEditor: evalEditor
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Control)
