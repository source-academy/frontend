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

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) => {
  return {
    updateCode: (newCode: string) => {
      dispatch(updateEditorValue(newCode))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundComponent)
