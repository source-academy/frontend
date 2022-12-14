import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { getTotalUserXp } from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import XpCalculation, { DispatchProps, StateProps } from './XpCalculation';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  allUserXp: state.session.allUserXp
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAllUserXpFetch: getTotalUserXp
    },
    dispatch
  );

const XpCalculationContainer = connect(mapStateToProps, mapDispatchToProps)(XpCalculation);

export default XpCalculationContainer;
