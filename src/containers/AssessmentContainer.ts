import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessment } from '../actions/session'
import Assessment, { DispatchProps, StateProps } from '../components/Assessment'
import { IState } from '../reducers/states'

export type OwnProps = { missionId: number }
const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    missionId: props.missionId,
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

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(
  Assessment
)
