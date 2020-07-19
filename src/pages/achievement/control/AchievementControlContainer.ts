import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  editAchievement,
  getAchievements,
  removeAchievement,
  removeGoal,
  saveAchievements
} from '../../../features/achievement/AchievementActions';
import AchievementInferencer from '../dashboard/subcomponents/utils/AchievementInferencer';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new AchievementInferencer(state.achievement.achievements)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAchievements: getAchievements,
      handleSaveAchievements: saveAchievements,
      handleEditAchievement: editAchievement,
      handleRemoveGoal: removeGoal,
      handleRemoveAchievement: removeAchievement
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
