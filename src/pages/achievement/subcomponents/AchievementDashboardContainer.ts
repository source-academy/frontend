import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../../commons/mocks/AchievementMocks';
import Constants from '../../../commons/utils/Constants';
import { getAchievements } from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: Constants.useBackend
    ? new AchievementInferencer(mockAchievements, mockGoals) // TODO: state.achievement.achievements
    : new AchievementInferencer(mockAchievements, mockGoals), //      state.achievement.goals
  name: state.session.name,
  group: state.session.group
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleGetAchievements: getAchievements
      // TODO: handleGetGoals: getGoals
      // TODO: handleGetOwnGoals: getOwnGoals
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
