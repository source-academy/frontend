import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { Role } from '../../reducers/states';
// TODO: Import from commons
import {
    acknowledgeNotifications,
    fetchAssessmentOverviews,
    submitAssessment
} from '../../actions/session';
import Assessment, {
    IAssessmentDispatchProps,
    IAssessmentOwnProps,
    IAssessmentStateProps
} from './AssessmentComponent';
import { IAssessmentOverview } from './AssessmentTypes';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IAssessmentStateProps, IAssessmentOwnProps, IState> = (state, props) => {
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

const mapDispatchToProps: MapDispatchToProps<IAssessmentDispatchProps, {}> = (dispatch: Dispatch<any>) =>
    bindActionCreators(
        {
            handleAcknowledgeNotifications: acknowledgeNotifications,
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
