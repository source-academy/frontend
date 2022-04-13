/* eslint-disable simple-import-sort/imports */

import { Assessment } from '../assessment/AssessmentTypes';
import { useEffect } from 'react';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { history } from '../utils/HistoryHelper';
// import { MouseEvent } from 'react';

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

  const toMission = (questionId: number) => {
    //HACKY METHOD, MUST CHANGE
    const listingPath = `/courses/5/${assessmentTypeLink(props.assessment!.type)}`;
    const assessmentWorkspacePath = listingPath + `/${props.assessment!.id.toString()}`;
    // const questionProgress: [number, number] = [questionId + 1, props.assessment!.questions.length];

    history.push(assessmentWorkspacePath + `/${questionId}`);
    //setSelectedTab(SideContentType.questionOverview);
  };

  return (
    <div>
      <h1 style={{ paddingLeft: '2rem' }}>Feedback</h1>
      <ul>
        {props.assessment?.questions.map((question, index) => (
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
