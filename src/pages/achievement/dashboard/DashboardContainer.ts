import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import { getAchievements } from '../../../commons/achievement/AchievementActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import Dashboard, { DispatchProps, StateProps } from './Dashboard';
import Inferencer from './subcomponents/utils/Inferencer';

const isTrue = (value?: string): boolean =>
  typeof value === 'string' && value.toUpperCase() === 'TRUE';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: isTrue(process.env.REACT_APP_USE_BACKEND)
    ? new Inferencer(state.achievement.achievements)
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

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
