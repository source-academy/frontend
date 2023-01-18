import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState, Role } from '../application/ApplicationTypes';
import Assessment, { OwnProps, StateProps } from './Assessment';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => ({
  assessmentOverviews: state.session.assessmentOverviews,
  isStudent: state.session.role ? state.session.role === Role.Student : true,
  courseId: state.session.courseId
});
const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AssessmentContainer = connect(mapStateToProps, mapDispatchToProps)(Assessment);

export default AssessmentContainer;
