import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import type { Assessment } from '../assessment/AssessmentTypes';
import { useAppSelector } from '../utils/Hooks';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

type Props = {
  assessment: Assessment;
  showToQuestion: boolean;
};

function AchievementCommentCard({ assessment, showToQuestion }: Props) {
  const navigate = useNavigate();
  const courseId = useAppSelector(store => store.session.courseId);
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
    [assessment?.id, assessment?.type, courseId, navigate],
  );

  return (
    <div>
      <h1 className="pl-8">Feedback</h1>
      <div className="pl-8 pr-8">
        {assessment &&
          assessment.questions.map((question, index) => (
            <div className="flex mb-2" key={index}>
              <span>
                <h2 className="mt-0">{'Q' + (index + 1)}</h2>
              </span>

              <div className="grow block px-4 whitespace-pre-wrap [word-break:break-word]">
                <p>{question.comments === null ? 'No Comments' : question.comments}</p>
                <p className="font-bold text-[orange]">
                  {'XP: ' + question.xp + '/' + question.maxXp}
                </p>
              </div>

              {showToQuestion && (
                <button
                  className="flex-none h-8 w-24 mb-4 rounded"
                  onClick={() => toMission(index)}
                >
                  {'To Question'}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default AchievementCommentCard;
