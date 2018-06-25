import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  changeChapter,
  changeEditorWidth,
  changeSideContentHeight
} from '../../actions/workspace'
import Workspace, { DispatchProps, StateProps } from '../../components/workspace/'
import { IState } from '../../reducers/states'

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
      handleSideContentHeightChange: changeSideContentHeight
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Workspace)
