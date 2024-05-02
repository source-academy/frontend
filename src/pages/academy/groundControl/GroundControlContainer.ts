import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  fetchAssessmentOverviews,
  fetchCourseConfig
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  assignEntriesForVoting,
  changeDateAssessment,
  changeTeamSizeAssessment,
  configureAssessment,
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
      handleFetchCourseConfigs: fetchCourseConfig,
      handleConfigureAssessment: configureAssessment,
      handleAssignEntriesForVoting: assignEntriesForVoting
    },
    dispatch
  );

const GroundControlContainer = connect(mapStateToProps, mapDispatchToProps)(GroundControl);

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = GroundControlContainer;
Component.displayName = 'GroundControl';

export default GroundControlContainer;
