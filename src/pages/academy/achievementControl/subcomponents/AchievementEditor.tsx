import React, { useState } from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import { AchievementItem, AchievementModalItem } from 'src/commons/achievements/AchievementTypes';
import { modalTemplate, achievementTemplate } from './editableCard/EditableTemplates';
import EditableAchievementAdder from './editableCard/EditableAchievementAdder';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
  achievementModalDict: { [id: number]: AchievementModalItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict, achievementModalDict } = props;

  const mapAchievementDictToEditableCard = (achievementDict: { [id: number]: AchievementItem }) => {
    return Object.values(achievementDict).map(achievement => (
      <EditableAchievementCard
        key={achievement.title}
        achievement={achievement}
        modal={achievementModalDict[achievement.id]}
      />
    ));
  };

  const [editableCards, setEditableCards] = useState<JSX.Element[]>(
    mapAchievementDictToEditableCard(achievementDict)
  );
  const templateCard = (
    <EditableAchievementCard achievement={achievementTemplate} modal={modalTemplate} />
  );

  const addNewCard = () => {
    const newCards = [...editableCards];
    newCards.push(templateCard);
    setEditableCards(newCards);
  };

  return (
    <div className="main">
      <ul className="display-list">{editableCards}</ul>
      <EditableAchievementAdder addNewCard={addNewCard} />
    </div>
  );
}

export default AchievementEditor;
