import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  changeChapter,
  changeEditorWidth,
  changeSideContentHeight,
  updateEditorValue
} from '../../actions/playground'
import Workspace, { DispatchProps, StateProps } from '../../components/workspace/'
import { SideContentTab } from '../../components/workspace/side-content'
import { IState } from '../../reducers/states'
import { OwnProps as ControlBarOwnProps } from './ControlBarContainer'

/** Provides the editorValue of the `IPlaygroundState` of the `IState` as a
 * `StateProps` to the Playground component
 */
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorWidth: state.playground.editorWidth,
    sideContentHeight: state.playground.sideContentHeight
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      changeChapter,
      handleEditorWidthChange: changeEditorWidth,
      handleSideContentHeightChange: changeSideContentHeight,
      updateEditorValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Workspace)
