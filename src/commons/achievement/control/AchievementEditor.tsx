import React, { useState } from 'react';

import AchievementInferencer from '../utils/AchievementInferencer';
import EditableAchievementCard from './editorTools/EditableAchievementCard';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: AchievementInferencer;
  forceRender: () => void;
  publishState: [boolean, any];
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer, forceRender, publishState } = props;

  /**
   * NOTE: This helps us to ensure that only ONE achievement is added
   * every time.
   *
   * Refering to AchievementAdder, if the adderId is -1, this
   * means that currently no achievement is being added and the admin is able to
   * add a new achievement.
   *
   * Alternatievly, if the adderId is not -1, this means that currently an achievement
   * is being added to the systen and the admin is not allowed to add two achievements
   * at one go.
   */
  const controlState = useState<number>(-1);

  const generateEditableCards = (inferencer: AchievementInferencer) => {
    const achievementIds = inferencer.listIds().reverse();
    return achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        id={id}
        inferencer={inferencer}
        controlState={controlState}
        forceRender={forceRender}
        publishState={publishState}
      />
    ));
  };

  return (
    <div className="achievement-editor">
      <div className="achievement-command">
        <AchievementAdder inferencer={inferencer} controlState={controlState} />
      </div>
      <ul className="achievement-container">{generateEditableCards(inferencer)}</ul>
    </div>
  );
}

export default AchievementEditor;
