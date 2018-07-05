import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchGradingOverviews } from '../../../actions/session'
import Grading, { IDispatchProps, IStateProps } from '../../../components/academy/grading'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews,
  storedSubmissionId: state.workspaces.submissionId,
  storedQuestionId: state.workspaces.submissionId
})

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleUpdateCurrentSubmissionId: updateCurrentSubmissionId,
      handleResetAssessmentWorkspace: resetAssessmentWorkspace
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Grading)
