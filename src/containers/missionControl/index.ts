import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews, submitAssessment } from '../../actions/session';
import Assessment, { IDispatchProps, IStateProps } from '../../components/missionControl';
import { IState, Role } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = (state, props) => {
  const stateProps: IStateProps = {
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Assessment)
);
