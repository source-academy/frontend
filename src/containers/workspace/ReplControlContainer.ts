import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { chapterSelect, clearReplOutput, evalEditor, evalRepl } from '../../actions/playground'
import ReplControl, { IReplControlProps } from '../../components/workspace/ReplControl'
import { IState } from '../../reducers/states'

type DispatchProps = Pick<IReplControlProps, 'handleEvalRepl'> &
  Pick<IReplControlProps, 'handleChapterSelect'> &
  Pick<IReplControlProps, 'handleClearReplOutput'>

/** No-op mapStateToProps */
const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({})

/** Provides a callback function `handleEvalEditor`
 *  to evaluate code in the Editor.
 */
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalEditor: evalEditor,
      handleEvalRepl: evalRepl,
      handleChapterSelect: chapterSelect,
      handleClearReplOutput: clearReplOutput
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ReplControl)
