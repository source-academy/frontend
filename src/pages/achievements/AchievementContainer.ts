import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import { getAchievements } from '../../commons/achievements/AchievementActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import Achievement, { DispatchProps, StateProps } from './Achievement';
import Inferencer from './subcomponents/utils/Inferencer';

const isTrue = (value?: string): boolean =>
  typeof value === 'string' && value.toUpperCase() === 'TRUE';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: isTrue(process.env.REACT_APP_USE_BACKEND)
    ? new Inferencer(state.achievements.achievements)
    : new Inferencer(mockAchievements),
  name: state.session.name,
  group: state.session.group
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
