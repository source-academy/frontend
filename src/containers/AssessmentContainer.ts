import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessment } from '../actions/session'
import Assessment, { DispatchProps, StateProps } from '../components/Assessment'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    assessmentInfo:
      state.session.assessmentInfos === undefined
        ? undefined
        : state.session.assessmentInfos[props.missionId]
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentInfoFetch: fetchAssessment
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Assessment)
