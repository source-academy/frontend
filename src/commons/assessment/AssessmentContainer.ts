import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchAssessmentOverviews,
  submitAssessment
} from 'src/commons/application/actions/SessionActions';
import { IState, Role } from 'src/commons/types/ApplicationTypes'; 

import Assessment, {
  AssessmentWorkspaceParams,
  DispatchProps,
  OwnProps,
  StateProps,
} from './AssessmentComponent';
import { AssessmentOverview } from './AssessmentTypes';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (
  state,
  props
) => {
  const categoryFilter = (overview: AssessmentOverview) =>
    overview.category === props.assessmentCategory;
  const stateProps: StateProps = {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined,
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

interface IPropType extends OwnProps, RouteComponentProps<AssessmentWorkspaceParams> { }

export default withRouter<IPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Assessment)
);
