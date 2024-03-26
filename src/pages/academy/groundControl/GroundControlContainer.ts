import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  fetchAssessmentOverviews,
  fetchCourseConfig
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  changeDateAssessment,
  changeTeamSizeAssessment,
  configureAssessment,
  deleteAssessment,
  publishAssessment,
  uploadAssessment
} from '../../../features/groundControl/GroundControlActions';
import GroundControl, { DispatchProps } from './GroundControl';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentChangeDate: changeDateAssessment,
      handleAssessmentChangeTeamSize: changeTeamSizeAssessment,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleDeleteAssessment: deleteAssessment,
      handleUploadAssessment: uploadAssessment,
      handlePublishAssessment: publishAssessment,
      handleFetchCourseConfigs: fetchCourseConfig,
      handleConfigureAssessment: configureAssessment
    },
    dispatch
  );

const GroundControlContainer = connect(mapStateToProps, mapDispatchToProps)(GroundControl);

export default GroundControlContainer;
