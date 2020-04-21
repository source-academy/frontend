import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews, saveCanvas, saveUserData } from '../actions';
import Game, { DispatchProps, StateProps } from '../components/academy/game';
import { IState } from '../reducers/states';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleSaveCanvas: saveCanvas,
      handleSaveData: saveUserData,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews
    },
    dispatch
  );

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  canvas: state.academy.gameCanvas,
  name: state.session.name!,
  story: state.session.story,
  gameState: state.session.gameState,
  role: state.session.role,
  assessmentOverviews: state.session.assessmentOverviews
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
