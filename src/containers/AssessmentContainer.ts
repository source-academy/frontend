import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessment } from '../actions/session'
import Assessment, { DispatchProps, OwnProps, StateProps } from '../components/assessment'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    assessment: state.session.assessments.get(props.missionId)
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Assessment)
