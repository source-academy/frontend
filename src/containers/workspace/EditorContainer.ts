import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { handleInterruptExecution } from '../../actions/interpreter'
import { evalEditor, updateEditorValue } from '../../actions/playground'
import Editor, { IEditorProps } from '../../components/workspace/Editor'
import { IState } from '../../reducers/states'

type StateProps = Pick<IEditorProps, 'editorValue'> & Pick<IEditorProps, 'isRunning'>
type DispatchProps = Pick<IEditorProps, 'handleEditorValueChange'> &
  Pick<IEditorProps, 'handleEvalEditor'> &
  Pick<IEditorProps, 'handleInterruptEval'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue,
    isRunning: state.playground.isRunning
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorValueChange: updateEditorValue,
      handleEvalEditor: evalEditor,
      handleInterruptEval: handleInterruptExecution
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
