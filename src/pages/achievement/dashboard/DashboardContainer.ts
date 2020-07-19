import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { mockAchievements } from '../../../commons/mocks/AchievementMocks';
import { getAchievements } from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './Dashboard';
import AchievementInferencer from './subcomponents/utils/AchievementInferencer';

const isTrue = (value?: string): boolean =>
  typeof value === 'string' && value.toUpperCase() === 'TRUE';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: isTrue(process.env.REACT_APP_USE_BACKEND)
    ? new AchievementInferencer(state.achievement.achievements)
    : new AchievementInferencer(mockAchievements),
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

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
