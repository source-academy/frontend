import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../../commons/mocks/AchievementMocks';
import Constants from '../../../commons/utils/Constants';
import {
  getAchievements,
  getOwnGoals,
  updateGoalProgress
} from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  group: state.session.group,
  inferencer: Constants.useAchievementBackend
    ? new AchievementInferencer(state.achievement.achievements, state.achievement.goals)
    : new AchievementInferencer(mockAchievements, mockGoals),
  name: state.session.name,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      getAchievements,
      getOwnGoals,
      updateGoalProgress
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
