import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import Achievement, { DispatchProps, StateProps } from './Achievement';
import { getAchievements } from 'src/commons/achievements/AchievementActions';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  achievementData: state.achievements.achievements
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements
    },
    dispatch
  );

const AchievementContainer = connect(mapStateToProps, mapDispatchToProps)(Achievement);

export default AchievementContainer;
