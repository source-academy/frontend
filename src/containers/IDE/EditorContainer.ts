import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalEditor, updateEditorValue } from '../../actions/playground'
import Editor, { IEditorProps } from '../../components/IDE/Editor'
import { IState } from '../../reducers/states'

type StateProps = Pick<IEditorProps, 'editorValue'>
type DispatchProps = Pick<IEditorProps, 'handleEditorChange'> & Pick<IEditorProps, 'handleEvalEditor'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorChange: updateEditorValue,
      handleEvalEditor: evalEditor
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
