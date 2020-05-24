import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import {
  acknowledgeNotifications,
  fetchAssessmentOverviews,
  submitAssessment
} from 'src/actions/session';
// TODO: Import from commons
import { Role } from 'src/reducers/states';
// TODO: Import from commons
import { IState } from 'src/reducers/states';
import Assessment, {
  IAssessmentWorkspaceParams,
  IAssessmentDispatchProps,
  IAssessmentOwnProps,
  IAssessmentStateProps
} from './AssessmentComponent';
import { IAssessmentOverview } from './AssessmentTypes';

const mapStateToProps: MapStateToProps<IAssessmentStateProps, IAssessmentOwnProps, IState> = (
  state,
  props
) => {
  const categoryFilter = (overview: IAssessmentOverview) =>
    overview.category === props.assessmentCategory;
  const stateProps: IAssessmentStateProps = {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined,
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<IAssessmentDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

interface IPropType extends IAssessmentOwnProps, RouteComponentProps<IAssessmentWorkspaceParams> { }

export default withRouter<IPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Assessment)
);
