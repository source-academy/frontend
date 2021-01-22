import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Constants from 'src/commons/utils/Constants';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../../commons/mocks/AchievementMocks';
import {
  bulkUpdateAchievements,
  bulkUpdateGoals,
  getAchievements,
  getOwnGoals
} from '../../../features/achievement/AchievementActions';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: Constants.useAchievementBackend
    ? new AchievementInferencer(state.achievement.achievements, state.achievement.goals)
    : new AchievementInferencer(mockAchievements, mockGoals)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      bulkUpdateAchievements,
      bulkUpdateGoals,
      getAchievements,
      getOwnGoals
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
