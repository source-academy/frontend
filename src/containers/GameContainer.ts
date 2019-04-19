import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { saveCanvas } from '../actions/game';
import Game, { DispatchProps, StateProps } from '../components/academy/game';
import { IState } from '../reducers/states';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleSaveCanvas: saveCanvas
    },
    dispatch
  );

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  canvas: state.academy.gameCanvas,
  name: state.session.name!,
  story: state.session.story
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
