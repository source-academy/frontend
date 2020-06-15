import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
