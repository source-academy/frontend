import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import {
  fetchAssessmentOverviews,
  fetchCourseConfig
} from 'src/commons/application/actions/SessionActions';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import {
  changeDateAssessment,
  deleteAssessment,
  publishAssessment,
  uploadAssessment
} from 'src/features/groundControl/GroundControlActions';

import GroundControl, { DispatchProps, StateProps } from './GroundControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  assessmentConfigurations: state.session.assessmentConfigurations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentChangeDate: changeDateAssessment,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleDeleteAssessment: deleteAssessment,
      handleUploadAssessment: uploadAssessment,
      handlePublishAssessment: publishAssessment,
      handleFetchCourseConfigs: fetchCourseConfig
    },
    dispatch
  );

const GroundControlContainer = connect(mapStateToProps, mapDispatchToProps)(GroundControl);

export default GroundControlContainer;
