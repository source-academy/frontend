import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import AchievementAdder from './achievementEditor/AchievementAdder';
import EditableCard from './achievementEditor/EditableCard';

let editableCards: JSX.Element[] = [];

type Props = {
  requestPublish: () => void;
};

const AchievementEditor: React.FC<Props> = ({ requestPublish }) => {
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
   */
  const [newUuid, setNewUuid] = useState('');
  const allowNewUuid = newUuid === '';
  const releaseUuid = () => setNewUuid('');

  const removeCard = (uuid: string) => {
    let idx = 0;
    while (editableCards[idx].key !== uuid && idx < editableCards.length) {
      idx++;
    }
    editableCards.splice(idx, 1);
  };

  const generateEditableCard = (achievementUuid: string, isNewAchievement: boolean) => (
    <EditableCard
      key={achievementUuid}
      uuid={achievementUuid}
      isNewAchievement={isNewAchievement}
      releaseUuid={releaseUuid}
      removeCard={removeCard}
      requestPublish={requestPublish}
    />
  );

  // load preexisting achievements from the inferencer
  if (editableCards.length === 0) {
    editableCards = inferencer
      .listSortedAchievementUuids()
      .map(uuid => generateEditableCard(uuid, false));
  }

  const addNewAchievement = (uuid: string) => {
    setNewUuid(uuid);
    // keep the new achievement on top by swapping it with the first achievement
    editableCards[editableCards.length] = editableCards[0];
    editableCards[0] = generateEditableCard(uuid, true);
  };

  return (
    <div className="achievement-editor">
      <div className="command">
        <AchievementAdder allowNewUuid={allowNewUuid} setNewUuid={addNewAchievement} />
      </div>
      <ul className="achievement-container">{editableCards}</ul>
    </div>
  );
};

export default AchievementEditor;
