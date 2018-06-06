import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { changeEditorWidth, changeSideContentHeight } from '../../actions/playground'
import Workspace, { IWorkspaceProps } from '../../components/workspace/'
import { IState } from '../../reducers/states'

type StateProps = Pick<IWorkspaceProps, 'editorWidth'> & Pick<IWorkspaceProps, 'sideContentHeight'>
type DispatchProps = Pick<IWorkspaceProps, 'handleEditorWidthChange'> &
  Pick<IWorkspaceProps, 'handleSideContentHeightChange'>

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
      handleEditorWidthChange: changeEditorWidth,
      handleSideContentHeightChange: changeSideContentHeight
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Workspace)
