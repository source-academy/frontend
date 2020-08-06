import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { getUsers } from '../../../commons/application/actions/SessionActions';
import { OverallState, UserSimpleState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../../commons/mocks/AchievementMocks';
import Constants from '../../../commons/utils/Constants';
import { getAchievements } from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: Constants.useBackend
    ? new AchievementInferencer(mockAchievements, mockGoals) // TODO: state.achievement.goals
    : new AchievementInferencer(mockAchievements, mockGoals),
  name: state.session.name,
  role: state.session.role,
  group: state.session.group,
  users: state.session.users as UserSimpleState[]
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
