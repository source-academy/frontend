import { bindActionCreators, Dispatch } from '@reduxjs/toolkit';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import SessionActions from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import GroundControlActions from '../../../features/groundControl/GroundControlActions';
import GroundControl, { DispatchProps } from './GroundControl';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentChangeDate: GroundControlActions.changeDateAssessment,
      handleAssessmentChangeTeamSize: GroundControlActions.changeTeamSizeAssessment,
      handleAssessmentOverviewFetch: SessionActions.fetchAssessmentOverviews,
      handleDeleteAssessment: GroundControlActions.deleteAssessment,
      handleUploadAssessment: GroundControlActions.uploadAssessment,
      handlePublishAssessment: GroundControlActions.publishAssessment,
      handlePublishGradingAll: GroundControlActions.publishGradingAll,
      handleUnpublishGradingAll: GroundControlActions.unpublishGradingAll,
      handleFetchCourseConfigs: SessionActions.fetchCourseConfig,
      handleConfigureAssessment: GroundControlActions.configureAssessment,
      handleAssignEntriesForVoting: GroundControlActions.assignEntriesForVoting
    },
    dispatch
  );

const GroundControlContainer = connect(mapStateToProps, mapDispatchToProps)(GroundControl);

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = GroundControlContainer;
Component.displayName = 'GroundControl';

export default GroundControlContainer;
