import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchGradingOverviews } from '../../../actions/session'
import { resetAssessmentWorkspace, updateCurrentSubmissionId } from '../../../actions/workspaces'
import Grading, { IDispatchProps, IStateProps } from '../../../components/academy/grading'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews,
  storedSubmissionId: state.workspaces.currentSubmission,
  storedQuestionId: state.workspaces.currentQuestion
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
