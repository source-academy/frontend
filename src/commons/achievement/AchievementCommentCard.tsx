import { useMemo } from 'react';

import { Assessment } from '../assessment/AssessmentTypes';
import { history } from '../utils/HistoryHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

export type OwnProps = {
  assessment: Assessment;
  courseId?: number;
};

const AchievementCommentCard = ({ assessment, courseId }: OwnProps) => {
  const toMission = useMemo(
    () => (questionId: number) => {
      if (!courseId) {
        showWarningMessage('Course ID not found');
        return;
      }

      const listingPath = `/courses/${courseId}/${assessmentTypeLink(assessment?.type)}`;
      const assessmentWorkspacePath = listingPath + `/${assessment?.id.toString()}`;
      history.push(assessmentWorkspacePath + `/${questionId}`);
    },
    [assessment?.id, assessment?.type, courseId]
  );

  return (
    <div>
      <h1 className="assessment-feedback">Feedback</h1>
      <div className="feedback-list">
        {assessment &&
          assessment.questions.map((question, index) => (
            <div className="assessment-comments" key={index}>
              <span>
                <h2 className="question-header">{'Q' + (index + 1)}</h2>
              </span>

              <div className="box-comment">
                <p>{question.comments === null ? 'Not Graded' : question.comments}</p>
                <p className="xp">{'XP: ' + question.xp + '/' + question.maxXp}</p>
              </div>

              <button className="to-assessment-button" onClick={() => toMission(index)}>
                {'To Question'}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AchievementCommentCard;
