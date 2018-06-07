import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { briefStudent, fetchAssessment } from '../actions/session'
import Assessment, { DispatchProps, OwnProps, StateProps } from '../components/Assessment'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    ...props,
    assessmentInfo:
      state.session.assessmentInfos === undefined
        ? undefined
        : state.session.assessmentInfos[props.missionId]
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentInfoFetch: fetchAssessment,
      hanldeBriefStudent: briefStudent
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Assessment)
