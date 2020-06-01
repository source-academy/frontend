import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchAssessmentOverviews,
  submitAssessment
} from '../../actions/session';
import Assessment, {
  IAssessmentWorkspaceParams,
  IDispatchProps,
  IOwnProps,
  IStateProps
} from '../../components/assessment';
import { IAssessmentOverview } from '../../components/assessment/assessmentShape';
import { IState, Role } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, IOwnProps, IState> = (state, props) => {
  const categoryFilter = (overview: IAssessmentOverview) =>
    overview.category === props.assessmentCategory;
  const stateProps: IStateProps = {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined,
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

interface IPropType extends IOwnProps, RouteComponentProps<IAssessmentWorkspaceParams> {}

export default withRouter<IPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Assessment)
);
