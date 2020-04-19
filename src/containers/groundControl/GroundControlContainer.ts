import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  changeDateAssessment,
  deleteAssessment,
  publishAssessment,
  uploadAssessment
} from '../../actions/groundControl';
import { fetchAssessmentOverviews } from '../../actions/session';
import GroundControl, {
  IDispatchProps,
  IStateProps
} from '../../components/groundControl/GroundControl';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews ? state.session.assessmentOverviews : []
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentChangeDate: changeDateAssessment,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleDeleteAssessment: deleteAssessment,
      handleUploadAssessment: uploadAssessment,
      handlePublishAssessment: publishAssessment
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroundControl);
