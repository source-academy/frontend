import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { Dispatch } from 'redux'

import { updateEditorValue } from '../actions/playground'
import { Editor, IEditorProps, Playground } from '../components/Playground'
import { IState } from '../reducers'

type StateProps = Pick<IEditorProps, 'editorValue'>
type DispatchProps = Pick<IEditorProps, 'handleEditorChange'>

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapEditorStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue
  }
}

/** Provides a callback function `updateCode` which supplies the `Action`
 * `updateEditorValue` with `newCode`, the updated contents of the react-ace
 * editor.
 */
const mapEditorDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) => {
  return {
    handleEditorChange: (newCode: string) => {
      dispatch(updateEditorValue(newCode))
    }
  }
}

export default connect()(Playground)
export const EditorContainer =  connect(mapEditorStateToProps, mapEditorDispatchToProps)(Editor)
