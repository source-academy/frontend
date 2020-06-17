import React from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import {
  AchievementItem,
  AchievementAbility,
  AchievementStatus
} from 'src/commons/achievements/AchievementTypes';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict } = props;

  const newAchievement: AchievementItem = {
    id: Object.keys(achievementDict).length,
    title: '',
    ability: AchievementAbility.ACADEMIC,
    isTask: true,
    status: AchievementStatus.ACTIVE,
    completionGoal: 0
  };

  return (
    <div className="main">
      <ul className="display-list">
        {Object.values(achievementDict).map(achievement => (
          <li key={achievement.title}>
            <EditableAchievementCard achievement={achievement} />
          </li>
        ))}
        <EditableAchievementCard achievement={newAchievement} />
      </ul>
    </div>
  );
}

export default AchievementEditor;
