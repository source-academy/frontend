/* eslint-disable simple-import-sort/imports */

import { Assessment } from '../assessment/AssessmentTypes';
import { useEffect } from 'react';

export type AssessmentWorkspaceProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void;
};

export type OwnProps = {
  assessmentId: number;
};

export type StateProps = {
  assessment?: Assessment;
};

const AchievementCommentCard: React.FC<AssessmentWorkspaceProps> = props => {
  //NEED TO MAKE THIS ONLY CALL END ONCE WE GET THE DATA
  useEffect(() => {
    if (!Number.isNaN(props.assessmentId)) {
      props.handleAssessmentFetch(props.assessmentId);
    }
  });

  return <div>{props.assessment?.questions[0].comments || 'No comments here'}</div>;
};

export default AchievementCommentCard;
