import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../commons/application/ApplicationTypes';
import Achievement from './Achievement';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AchievementContainer = connect(mapStateToProps, mapDispatchToProps)(Achievement);

export default AchievementContainer;
