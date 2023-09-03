import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Assessment } from '../assessment/AssessmentTypes';
import { useTypedSelector } from '../utils/Hooks';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

const AchievementCommentCard: React.FC<{
  assessment: Assessment;
  showToQuestion: boolean;
}> = ({ assessment, showToQuestion }) => {
  const navigate = useNavigate();
  const courseId = useTypedSelector(store => store.session.courseId);
  const toMission = useMemo(
    () => (questionId: number) => {
      if (!courseId) {
        showWarningMessage('Course ID not found');
        return;
      }

      const listingPath = `/courses/${courseId}/${assessmentTypeLink(assessment?.type)}`;
      const assessmentWorkspacePath = listingPath + `/${assessment?.id.toString()}`;
      navigate(assessmentWorkspacePath + `/${questionId}`);
    },
    [assessment?.id, assessment?.type, courseId, navigate]
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
                <p>{question.comments === null ? 'No Comments' : question.comments}</p>
                <p className="xp">{'XP: ' + question.xp + '/' + question.maxXp}</p>
              </div>

              {showToQuestion && (
                <button className="to-assessment-button" onClick={() => toMission(index)}>
                  {'To Question'}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AchievementCommentCard;
