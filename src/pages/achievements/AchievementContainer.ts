import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import Achievement, { DispatchProps, StateProps } from './Achievement';
import { getAchievements } from '../../commons/achievements/AchievementActions';
import Inferencer from './subcomponents/utils/Inferencer';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { withRouter } from 'react-router';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(state.achievements.achievements)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements
    },
    dispatch
  );

const AchievementContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Achievement));

export default AchievementContainer;
