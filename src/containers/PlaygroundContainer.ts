import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { Dispatch } from 'redux'

import { updateEditorValue } from '../actions/playground'
import {
  default as PlaygroundComponent,
  IPlaygroundProps as PlaygroundProps
} from '../components/Playground'
import { IState } from '../reducers'

type StateProps = Pick<PlaygroundProps, 'editorValue'>
type DispatchProps = Pick<PlaygroundProps, 'updateCode'>

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
    updateCode: (newCode: string) => {
      dispatch(updateEditorValue(newCode))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundComponent)
