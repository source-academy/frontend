import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementDashboard, { StateProps } from './AchievementDashboard';

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

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(AchievementDashboard);

export default DashboardContainer;
