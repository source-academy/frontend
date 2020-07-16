import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import Achievement, { DispatchProps, StateProps } from './Achievement';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  role: state.session.role!
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AchievementContainer = connect(mapStateToProps, mapDispatchToProps)(Achievement);

export default AchievementContainer;
