import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';
import {
  getAchievements,
  updateAchievements,
  editAchievement
} from '../../../commons/achievements/AchievementActions';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(state.achievements.achievements)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAchievements: getAchievements,
      handleUpdateAchievements: updateAchievements,
      handleEditAchievement: editAchievement
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
