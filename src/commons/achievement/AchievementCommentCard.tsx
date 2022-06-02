import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { Assessment } from '../assessment/AssessmentTypes';
import { history } from '../utils/HistoryHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

export type OwnProps = {
  assessment: Assessment;
};

const AchievementCommentCard = ({ assessment }: OwnProps) => {
  const courseId = useSelector((store: OverallState) => store.session.courseId);

  const toMission = (questionId: number) => {
    const listingPath = `/courses/${courseId}/${assessmentTypeLink(assessment?.type)}`;
    const assessmentWorkspacePath = listingPath + `/${assessment?.id.toString()}`;
    history.push(assessmentWorkspacePath + `/${questionId}`);
  };

  return (
    <div>
      <h1 style={{ paddingLeft: '2rem' }}>Feedback</h1>
      <ul>
        {assessment &&
          assessment.questions.map((question, index) => (
            <div className="commentsxxx" key={index}>
              <span className="commentsh">
                <h2 style={{ marginTop: 0 }}>{'Q' + (index + 1)}</h2>
              </span>

              <div className="boxcomment">
                <p>{question.comments === null ? 'Not Graded' : question.comments}</p>
                <p style={{ fontWeight: 700, color: 'orange' }}>
                  {'XP: ' + question.xp + '/' + question.maxXp}
                </p>
              </div>

              <button className="missionbutton" onClick={() => toMission(index)}>
                {'To Question'}{' '}
              </button>
            </div>
          ))}
      </ul>
    </div>
  );
};

export default AchievementCommentCard;
