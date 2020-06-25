import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';
import {
  getAchievements,
  updateAchievements
} from '../../../commons/achievements/AchievementActions';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  achievementItems: state.achievements.achievements
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements,
      handleAchievementsUpdate: updateAchievements
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
