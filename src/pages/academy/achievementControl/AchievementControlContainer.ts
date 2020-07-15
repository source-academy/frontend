import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  editAchievement,
  getAchievements,
  removeAchievement,
  removeGoal,
  saveAchievements,
  updateAchievements
} from '../../../commons/achievements/AchievementActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(state.achievements.achievements)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAchievements: getAchievements,
      handleUpdateAchievements: updateAchievements,
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
