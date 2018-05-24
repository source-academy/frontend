import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalEditor, updateEditorValue, updateEditorWidth } from '../../actions/playground'
import Editor, { IEditorProps } from '../../components/IDE/Editor'
import { IState } from '../../reducers/states'

type StateProps = Pick<IEditorProps, 'editorValue'> & Pick<IEditorProps, 'editorWidth'>
type DispatchProps = Pick<IEditorProps, 'handleEditorValueChange'> &
  Pick<IEditorProps, 'handleEditorWidthChange'> &
  Pick<IEditorProps, 'handleEvalEditor'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue,
    editorWidth: state.playground.editorWidth
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorValueChange: updateEditorValue,
      handleEditorWidthChange: updateEditorWidth,
      handleEvalEditor: evalEditor
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
