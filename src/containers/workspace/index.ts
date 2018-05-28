import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { changeEditorWidth } from '../../actions/playground'
import IDE, { IIDEProps } from '../../components/workspace/'
import { IState } from '../../reducers/states'

type StateProps = Pick<IIDEProps, 'editorWidth'>
type DispatchProps = Pick<IIDEProps, 'handleEditorWidthChange'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorWidth: state.playground.editorWidth
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorWidthChange: changeEditorWidth
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(IDE)
