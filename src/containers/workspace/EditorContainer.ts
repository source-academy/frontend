import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalEditor, updateEditorValue } from '../../actions/playground'
import Editor, { IEditorProps } from '../../components/workspace/Editor'
import { IState } from '../../reducers/states'

type DispatchProps = Pick<IEditorProps, 'handleEditorValueChange'> &
  Pick<IEditorProps, 'handleEditorEval'>

const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorEval: evalEditor,
      handleEditorValueChange: updateEditorValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
