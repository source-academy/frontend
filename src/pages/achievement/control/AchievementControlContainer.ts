import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  bulkUpdateAchievements,
  bulkUpdateGoals,
  getAchievements,
  getOwnGoals,
  removeAchievement,
  removeGoal
} from '../../../features/achievement/AchievementActions';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new AchievementInferencer(state.achievement.achievements, state.achievement.goals)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      bulkUpdateAchievements,
      bulkUpdateGoals,
      getAchievements,
      getOwnGoals,
      removeAchievement,
      removeGoal
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
