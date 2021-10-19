import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { fetchAssessmentOverviews } from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  getAchievements,
  getGoals,
  getOwnGoals,
  getUserAssessmentOverviews,
  getUsers,
  updateGoalProgress
} from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  group: state.session.group,
  inferencer: new AchievementInferencer(state.achievement.achievements, state.achievement.goals),
  name: state.session.name,
  role: state.session.role,
  assessmentOverviews: state.session.assessmentOverviews,
  achievementAssessmentOverviews: state.achievement.assessmentOverviews,
  users: state.achievement.users,
  assessmentConfigs: state.session.assessmentConfigurations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchAssessmentOverviews,
      getAchievements,
      getGoals,
      getOwnGoals,
      getUserAssessmentOverviews,
      getUsers,
      updateGoalProgress
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
