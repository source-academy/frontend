import React from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict } = props;

  return (
    <div className="main">
      <ul className="display-list">
        {Object.values(achievementDict).map(achievement => (
          <li key={`achievement ${achievement.id}`}>
            <EditableAchievementCard achievement={achievement} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AchievementEditor;
