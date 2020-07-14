import React from 'react';

import Inferencer from './utils/Inferencer';
import AchievementWeek from './utils/AchievementWeek';
import AchievementModalGoal from './modal/AchievementModalGoal';
import { AchievementStatus, AchievementAbility } from 'src/commons/achievements/AchievementTypes';
import AchievementModalCompletion from './modal/AchievementModalCompletion';
import { prettifyDate } from './utils/DateHelper';

type AchievementModalProps = {
  id: number;
  inferencer: Inferencer;
  handleGlow: any;
};

function AchievementModal(props: AchievementModalProps) {
  const { id, inferencer, handleGlow } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { title, ability, goals, modal } = achievement;
  const { modalImageUrl, description, completionText } = modal;

  const status = inferencer.getStatus(id);
  const awardedExp = inferencer.getStudentExp(id);
  const deadline = inferencer.getFurthestDeadline(id);

  // Entire modal background
  const handleBackground = (ability: AchievementAbility) => {
    const assetUrl =
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/background';
    switch (ability) {
      case AchievementAbility.CORE:
        return {
          background: `url(${assetUrl}/core-background.png) no-repeat center`
        };
      case AchievementAbility.EFFORT:
        return {
          background: `url(${assetUrl}/annotated-background.png) no-repeat center`
        };
      case AchievementAbility.EXPLORATION:
        return {
          background: `url(${assetUrl}/exploration-background.png) no-repeat center`
        };
      case AchievementAbility.COMMUNITY:
        return {
          background: `url(${assetUrl}/community-background.png) no-repeat center`
        };
      default:
        return {
          background: 'black'
        };
    }
  };

  return (
    <div className="modal" style={{ ...handleGlow(id), ...handleBackground(ability) }}>
      <div
        className="canvas"
        style={{
          backgroundImage: `url(${modalImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline !== undefined ? (
          <div className="deadline">
            <p>{`Deadline: ${prettifyDate(deadline)}`}</p>
            <AchievementWeek week={deadline} />
          </div>
        ) : null}
        <div className="description">
          <p>{description}</p>
        </div>
      </div>
      <AchievementModalGoal goals={goals} />
      <hr />
      {status === AchievementStatus.COMPLETED ? (
        <AchievementModalCompletion awardedExp={awardedExp} completionText={completionText} />
      ) : null}
    </div>
  );
}

export default AchievementModal;
