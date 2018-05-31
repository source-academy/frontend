import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchMissions } from '../../actions/session'
import Missions, { IMissionsProps } from '../../components/device/Announcements'
import { IState } from '../../reducers/states'

type StateProps = Pick<IMissionsProps, 'missions'>
type DispatchProps = Pick<IMissionsProps, 'handleMissionsFetch'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    missions: state.session.missions
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleMissionsFetch: fetchMissions
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Missions)
