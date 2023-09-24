import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { actions } from 'src/commons/redux/ActionsHelper';
import { OverallState } from 'src/commons/redux/AllTypes';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new AchievementInferencer(state.achievement.achievements, state.achievement.goals)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      bulkUpdateAchievements: actions.bulkUpdateAchievements,
      bulkUpdateGoals: actions.bulkUpdateGoals,
      getAchievements: actions.getAchievements,
      getOwnGoals: actions.getOwnGoals,
      removeAchievement: actions.removeAchievement,
      removeGoal: actions.removeGoal
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
