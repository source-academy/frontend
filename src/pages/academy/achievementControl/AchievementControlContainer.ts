import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';
import {
  getAchievements,
  updateAchievements,
  addAchievement,
  editAchievement
} from '../../../commons/achievements/AchievementActions';
import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { defaultAchievementData } from 'src/commons/mocks/AchievementMocks';

// TODO: replace defaultAchievementData with fetch database data
const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(defaultAchievementData)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements,
      handleAchievementsUpdate: updateAchievements,
      addAchievement: addAchievement,
      editAchievement: editAchievement
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
