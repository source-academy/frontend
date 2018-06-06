import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchMissionsInfo } from '../../actions/session'
import Missions, { IMissionsProps } from '../../components/academy/Missions'
import { IState } from '../../reducers/states'

type StateProps = Pick<IMissionsProps, 'missionsInfo'>
type DispatchProps = Pick<IMissionsProps, 'handleMissionsInfoFetch'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    missionsInfo: state.session.missionsInfo
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleMissionsInfoFetch: fetchMissionsInfo
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Missions)
