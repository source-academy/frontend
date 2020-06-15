import React from 'react';

import EditableAchievementCard from './EditableAchievementCard';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict } = props;

  return (
    <div className="main">
      <ul className="display-list">
        <li>
          {Object.values(achievementDict).map(achievement => (
            <EditableAchievementCard achievement={achievement} />
          ))}
        </li>
      </ul>
    </div>
  );
}

export default AchievementEditor;
