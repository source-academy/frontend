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

  return (
    <ul>
      {props.assessment?.questions.map((question, index) => (
        <div key={index}>
          <h2>{'Q' + (index + 1)}</h2>
          <p>{question.comments}</p>
          <p>{question.xp + '/' + question.maxXp}</p>
        </div>
      ))}
    </ul>
  );
};

export default AchievementCommentCard;
