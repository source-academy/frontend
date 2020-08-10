import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  forceRender: () => void;
  requestPublish: () => void;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { forceRender, requestPublish } = props;

  const inferencer = useContext(AchievementContext);

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

  const generateEditableCards = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        id={id}
        forceRender={forceRender}
        releaseId={releaseId}
        requestPublish={requestPublish}
      />
    ));

  return (
    <div className="achievement-editor">
      <div className="achievement-command">
        <AchievementAdder admitId={admitId} isHoldingId={isHoldingId} />
      </div>
      <ul className="achievement-container">
        {generateEditableCards(inferencer.listIds().reverse())}
      </ul>
    </div>
  );
}

export default AchievementEditor;
