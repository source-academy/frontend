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
   * newUuid helps us to ensure that only ONE achievement is added at any point of time.
   *
   * By default,  the newUuid is an empty string, which means currently no new achievement
   * is being added and the admin is able to add a new achievement.
   *
   * Conversely, if the newUuid is not an empty string, this means currently an achievement
   * is being added to the system and the admin is not allowed to add two achievements
   * at one go. The newUuid holds the newly created achievement uuid until the new achievement
   * is added into the inferencer.
   * 
   * NOTE: was previously NaN by default, unsure how this should change for uuid
   */
  const [newUuid, setNewUuid] = useState<string>('');
  const allowNewUuid = newUuid === '';
  const releaseUuid = (uuid: string) => (uuid === newUuid ? setNewUuid('') : undefined);

  /**
   * Generates <EditableAchievementCard /> components
   *
   * @param achievementUuids an array of achievementUuid
   */
  const generateEditableCards = (achievementUuids: string[]) =>
    achievementUuids.map(uuid => (
      <EditableCard
        key={uuid}
        uuid={uuid}
        releaseUuid={releaseUuid}
        requestPublish={requestPublish}
      />
    ));

  // NOTE: editable cards used to be sorted by id in descending order
  // However, UUID removes the guarantee of order preserving IDs
  return (
    <div className="achievement-editor">
      <div className="command">
        <AchievementAdder allowNewUuid={allowNewUuid} setNewUuid={setNewUuid} />
      </div>
      <ul className="achievement-container">
        {generateEditableCards(inferencer.getAllAchievementUuids().sort(
          (a, b) => inferencer.getAchievementPositionByUuid(b) - inferencer.getAchievementPositionByUuid(a)
        ))}
      </ul>
    </div>
  );
}

export default AchievementEditor;
