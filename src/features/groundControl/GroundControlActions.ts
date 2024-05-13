import { createActions } from 'src/commons/redux/utils';

const GroundControlActions = createActions('groundControl', {
  changeDateAssessment: (id: number, openAt: string, closeAt: string) => ({ id, openAt, closeAt }),
  changeTeamSizeAssessment: (id: number, maxTeamSize: number) => ({ id, maxTeamSize }),
  deleteAssessment: (id: number) => id,
  publishAssessment: (togglePublishAssessmentTo: boolean, id: number) => ({
    id,
    togglePublishAssessmentTo
  }),
  publishGradingAll: (id: number) => id,
  unpublishGradingAll: (id: number) => id,
  uploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) => ({
    file,
    forceUpdate,
    assessmentConfigId
  }),
  configureAssessment: (id: number, hasVotingFeatures: boolean, hasTokenCounter: boolean) => ({
    id,
    hasVotingFeatures,
    hasTokenCounter
  }),
  assignEntriesForVoting: (id: number) => ({ id })
});

// For compatibility with existing code (actions helper)
export default GroundControlActions;
