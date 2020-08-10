import React, { useState } from 'react';

import AchievementInferencer from '../utils/AchievementInferencer';
import EditableAchievementCard from './editorTools/EditableAchievementCard';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: AchievementInferencer;
  forceRender: () => void;
  requestPublish: () => void;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer, forceRender, requestPublish } = props;

  /**
   * newId helps us to ensure that only ONE achievement is added at any point of time.
   *
   * By default,  the newId is NaN, which means currently no new achievement
   * is being added and the admin is able to add a new achievement.
   *
   * Conversely, if the newId is not NaN, this means currently an achievement
   * is being added to the system and the admin is not allowed to add two achievements
   * at one go. The newId holds the newly created achievement id until the new achievement
   * is added into the AchievementInferencer.
   */
  const [newId, setNewId] = useState<number>(NaN);
  const admitId = (id: number) => setNewId(id);
  const releaseId = (id: number) => (id === newId ? setNewId(NaN) : undefined);
  const isHoldingId = !isNaN(newId);

  const generateEditableCards = (inferencer: AchievementInferencer) => {
    const achievementIds = inferencer.listIds().reverse();
    return achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        id={id}
        inferencer={inferencer}
        forceRender={forceRender}
        releaseId={releaseId}
        requestPublish={requestPublish}
      />
    ));
  };

  return (
    <div className="achievement-editor">
      <div className="achievement-command">
        <AchievementAdder inferencer={inferencer} admitId={admitId} isHoldingId={isHoldingId} />
      </div>
      <ul className="achievement-container">{generateEditableCards(inferencer)}</ul>
    </div>
  );
}

export default AchievementEditor;
