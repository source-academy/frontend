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
  deleteAssessment,
  publishAssessment,
  publishGradingAll,
  unpublishGradingAll,
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
      handlePublishGradingAll: publishGradingAll,
      handleUnpublishGradingAll: unpublishGradingAll,
      handleFetchCourseConfigs: fetchCourseConfig
    },
    dispatch
  );

const GroundControlContainer = connect(mapStateToProps, mapDispatchToProps)(GroundControl);

export default GroundControlContainer;
