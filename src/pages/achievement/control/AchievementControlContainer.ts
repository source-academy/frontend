import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../../commons/mocks/AchievementMocks';
import {
  editAchievement,
  editGoal,
  getAchievements,
  getOwnGoals,
  removeAchievement,
  removeGoal,
  saveAchievements,
  saveGoals
} from '../../../features/achievement/AchievementActions';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new AchievementInferencer(mockAchievements, mockGoals) // TODO: use redux store
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleEditAchievement: editAchievement,
      handleEditGoal: editGoal,
      handleGetAchievements: getAchievements,
      handleGetOwnGoals: getOwnGoals,
      handleRemoveAchievement: removeAchievement,
      handleRemoveGoal: removeGoal,
      handleSaveAchievements: saveAchievements,
      handleSaveGoals: saveGoals
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
