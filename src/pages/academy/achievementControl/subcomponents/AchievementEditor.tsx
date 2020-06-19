import React from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import { AchievementItem, AchievementModalItem } from 'src/commons/achievements/AchievementTypes';
import { modalTemplate, achievementTemplate } from './editableCard/AchievementTemplates';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
  achievementModalDict: { [id: number]: AchievementModalItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict, achievementModalDict } = props;

  return (
    <div className="main">
      <ul className="display-list">
        {Object.values(achievementDict).map((
          achievement // TODO: write map function for this, similar to Achievement.tsx
        ) => (
          <li key={achievement.title}>
            <EditableAchievementCard
              achievement={achievement}
              modal={achievementModalDict[achievement.id]}
            />
          </li>
        ))}
        <EditableAchievementCard achievement={achievementTemplate} modal={modalTemplate} />{' '}
        {/* TODO: create editor tool for this */}
      </ul>
    </div>
  );
}

export default AchievementEditor;
