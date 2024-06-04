import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  AchievementContext,
  getAbilityBackground,
  getAbilityGlow
} from '../../features/achievement/AchievementConstants';
import { AchievementStatus, AchievementUser } from '../../features/achievement/AchievementTypes';
import SessionActions from '../application/actions/SessionActions';
import { Assessment } from '../assessment/AssessmentTypes';
import { useTypedSelector } from '../utils/Hooks';
import AchievementCommentCard from './AchievementCommentCard';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type Props = {
  focusUuid: string;
  assessments?: Map<number, Assessment>;
  userState?: [AchievementUser | undefined, any];
};

const AchievementView: React.FC<Props> = ({ focusUuid, userState }) => {
  const assessmentId = !Number.isNaN(+focusUuid) && +focusUuid !== 0 ? +focusUuid : undefined;
  let courseRegId: number | undefined;

  if (userState) {
    const [selectedUser] = userState!;
    courseRegId = selectedUser?.courseRegId;
  }
  const userCrid = useTypedSelector(store => store.session.courseRegId);
  const isAdminView: boolean = courseRegId !== undefined && courseRegId !== userCrid;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(SessionActions.fetchAssessmentOverviews());
    if (!assessmentId) {
      return;
    }
    if (isAdminView) {
      // Fetch selected user's assessment from admin route
      // Safe to use non-null assertion (refer to `isAdminView` declaration above)
      dispatch(SessionActions.fetchAssessmentAdmin(assessmentId, courseRegId!));
    } else {
      // If user is student, fetch assessment details from assessment route instead, as seen below
      dispatch(SessionActions.fetchAssessment(assessmentId));
    }
  }, [dispatch, assessmentId, courseRegId, isAdminView]);

  const inferencer = useContext(AchievementContext);
  const assessments = useTypedSelector(store => store.session.assessments);
  const selectedAssessment: Assessment | undefined = assessments[assessmentId!];
  const allAssessmentConfigs = useTypedSelector(store => store.session.assessmentOverviews) ?? [];
  const selectedAssessmentConfig = allAssessmentConfigs.find(config => config.id === assessmentId);

  if (focusUuid === '') {
    return (
      <div className="no-view">
        <Icon icon={IconNames.MOUNTAIN} iconSize={60} />
        <h2>Select an achievement</h2>
      </div>
    );
  }
  const achievement = inferencer.getAchievement(focusUuid);
  const { deadline, title, view } = achievement;
  const { coverImage, completionText, description } = view;
  const awardedXp = inferencer.getAchievementXp(focusUuid);
  const goals = inferencer.listGoals(focusUuid);
  const status = inferencer.getStatus(focusUuid);

  const descriptionParagraphs = description ? description.split('\n') : [''];

  return (
    <div className="view" style={{ ...getAbilityGlow(), ...getAbilityBackground() }}>
      <div
        className="cover"
        style={{
          background: `rgba(0, 0, 0, 0.5) url(${coverImage}) center/cover`,
          backgroundBlendMode: `darken`
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline && <p>{`Deadline: ${prettifyDate(deadline)}`}</p>}
        <span className="description">
          {descriptionParagraphs.map((para, idx) => (
            <p key={idx}>
              {para}
              <br />
            </p>
          ))}
        </span>
      </div>

      {status === AchievementStatus.COMPLETED &&
        selectedAssessment &&
        selectedAssessmentConfig &&
        selectedAssessmentConfig.isManuallyGraded && (
          // TODO: showToQuestion is currently used to disable the goto question button for admins,
          // as it has not been integrated with the grading view yet
          <AchievementCommentCard assessment={selectedAssessment} showToQuestion={!isAdminView} />
        )}

      {goals.length > 0 && (
        <>
          <AchievementViewGoal goals={goals} />
          {status === AchievementStatus.COMPLETED && (
            <>
              <hr />
              <AchievementViewCompletion awardedXp={awardedXp} completionText={completionText} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AchievementView;
