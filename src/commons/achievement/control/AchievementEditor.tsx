import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import AchievementAdder from './achievementEditor/AchievementAdder';
import EditableCard from './achievementEditor/EditableCard';

type AchievementEditorProps = {
  requestPublish: () => void;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { requestPublish } = props;

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
   * is added into the inferencer.
   */
  const [newId, setNewId] = useState<number>(NaN);
  const allowNewId = isNaN(newId);
  const releaseId = (id: number) => (id === newId ? setNewId(NaN) : undefined);

  /**
   * Generates <EditableAchievementCard /> components
   *
   * @param achievementIds an array of achievementId
   */
  const generateEditableCards = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableCard key={id} id={id} releaseId={releaseId} requestPublish={requestPublish} />
    ));

  return (
    <div className="achievement-editor">
      <div className="command">
        <AchievementAdder allowNewId={allowNewId} setNewId={setNewId} />
      </div>
      <ul className="achievement-container">
        {generateEditableCards(inferencer.getAllAchievementIds().sort((a, b) => b - a))}
      </ul>
    </div>
  );
}

export default AchievementEditor;
