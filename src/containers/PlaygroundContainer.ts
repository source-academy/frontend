import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import Playground, { DispatchProps, StateProps } from '../components/Playground'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  editorValue: state.workspaces.playground.editorValue
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground))
