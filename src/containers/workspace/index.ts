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

export type OwnProps = {
  controlBarOptions?: ControlBarOwnProps
  libQuery?: number
  sideContentTabs: SideContentTab[]
  prgrmQuery?: string
}

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
      changeChapter,
      handleEditorWidthChange: changeEditorWidth,
      handleSideContentHeightChange: changeSideContentHeight,
      updateEditorValue
    },
    dispatch
  )

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(
  Workspace
)
