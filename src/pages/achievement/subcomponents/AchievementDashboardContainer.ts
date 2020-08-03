import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { getUsers } from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements } from '../../../commons/mocks/AchievementMocks';
import Constants from '../../../commons/utils/Constants';
import { getAchievements } from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: Constants.useBackend
    ? new AchievementInferencer(state.achievement.achievements)
    : new AchievementInferencer(mockAchievements),
  name: state.session.name,
  role: state.session.role,
  group: state.session.group,
  users: state.session.users
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements,
      handleUsersFetch: getUsers
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
