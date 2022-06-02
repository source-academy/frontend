import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AchievementContext,
  getAbilityBackground,
  getAbilityGlow
} from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import { FETCH_ASSESSMENT } from '../application/types/SessionTypes';
import { Assessment } from '../assessment/AssessmentTypes';
import AchievementCommentCard from './AchievementCommentCard';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  focusUuid: string;
};

export type OwnProps = {
  assessmentId: number;
};

function AchievementView(props: AchievementViewProps) {
  const { focusUuid } = props;

  const inferencer = useContext(AchievementContext);

  const dispatch = useDispatch();
  if (!Number.isNaN(+focusUuid) && +focusUuid !== 0) {
    dispatch({ type: FETCH_ASSESSMENT, payload: +focusUuid });
  }
  const assessments = useSelector((store: OverallState) => store.session.assessments);
  const assessment: Assessment = assessments.values().next().value;

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

      {status === AchievementStatus.COMPLETED && assessment && assessment.type === 'Missions' && (
        <AchievementCommentCard assessment={assessment} />
      )}

      <h1 style={{ paddingLeft: '2rem' }}>Progress</h1>
      {<AchievementViewGoal goals={goals} />}
      {status === AchievementStatus.COMPLETED && (
        <>
          <hr />
          <AchievementViewCompletion awardedXp={awardedXp} completionText={completionText} />
        </>
      )}
    </div>
  );
}

export default AchievementView;
