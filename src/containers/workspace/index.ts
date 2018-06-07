import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { changeEditorWidth, changeSideContentHeight } from '../../actions/playground'
import Workspace, { DispatchProps, OwnProps, StateProps } from '../../components/workspace/'
import { IState } from '../../reducers/states'

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    ...props,
    editorWidth: state.playground.editorWidth,
    sideContentHeight: state.playground.sideContentHeight
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorWidthChange: changeEditorWidth,
      handleSideContentHeightChange: changeSideContentHeight
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Workspace)
