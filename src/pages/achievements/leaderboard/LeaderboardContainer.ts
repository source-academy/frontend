import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import Leaderboard, { DispatchProps, StateProps } from './Leaderboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = () => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const LeaderboardContainer = connect(mapStateToProps, mapDispatchToProps)(Leaderboard);

export default LeaderboardContainer;
