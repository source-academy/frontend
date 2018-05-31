import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { handleInterruptExecution } from '../../actions/interpreter'
import { chapterSelect, evalEditor, updateEditorValue } from '../../actions/playground'
import Editor, { IEditorProps } from '../../components/workspace/Editor'
import { IState } from '../../reducers/states'

type StateProps = Pick<IEditorProps, 'editorValue'> &
  Pick<IEditorProps, 'isRunning'> &
  Pick<IEditorProps, 'sourceChapter'>
type DispatchProps = Pick<IEditorProps, 'handleEditorValueChange'> &
  Pick<IEditorProps, 'handleEditorEval'> &
  Pick<IEditorProps, 'handleInterruptEval'> &
  Pick<IEditorProps, 'handleChapterSelect'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    editorValue: state.playground.editorValue,
    isRunning: state.playground.isRunning,
    sourceChapter: state.playground.sourceChapter
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChapterSelect: chapterSelect,
      handleEditorValueChange: updateEditorValue,
      handleEditorEval: evalEditor,
      handleInterruptEval: handleInterruptExecution
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
