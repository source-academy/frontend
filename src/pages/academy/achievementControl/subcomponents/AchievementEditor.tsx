import React from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import { AchievementItem, AchievementModalItem } from 'src/commons/achievements/AchievementTypes';
import { modalTemplate, achievementTemplate } from './editableCard/EditableTemplates';

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

  return (
    <div className="main">
      <ul className="display-list">{mapAchievementDictToEditableCard(achievementDict)}</ul>
      <EditableAchievementCard achievement={achievementTemplate} modal={modalTemplate} />
      {/* TODO: create editor tool for this */}
    </div>
  );
}

export default AchievementEditor;
