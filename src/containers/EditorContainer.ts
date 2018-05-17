import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { Dispatch } from 'redux'

import { evalEditor, updateEditorValue } from '../actions/playground'
import Editor, { IEditorProps } from '../components/Editor'
import { IState } from '../reducers'

type StateProps = Pick<IEditorProps, 'editorValue'>
type DispatchProps = Pick<IEditorProps, 'handleEditorChange'> 
  & Pick<IEditorProps, 'handleEvalEditor'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue
  }
}

/** Provides a callback function `updateCode` which supplies the `Action`
 * `updateEditorValue` with `newCode`, the updated contents of the react-ace
 * editor.
 */
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) => {
  return {
    handleEditorChange: (newCode: string) => dispatch(updateEditorValue(newCode)),
    handleEvalEditor: () => dispatch(evalEditor())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
