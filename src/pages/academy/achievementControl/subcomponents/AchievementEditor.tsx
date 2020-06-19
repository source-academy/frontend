import React from 'react';

import EditableAchievementCard from './editableCard/EditableAchievementCard';
import {
  AchievementItem,
  AchievementAbility,
  AchievementStatus,
  AchievementModalItem
} from 'src/commons/achievements/AchievementTypes';

type AchievementEditorProps = {
  achievementDict: { [id: number]: AchievementItem };
  achievementModalDict: { [id: number]: AchievementModalItem };
};

function AchievementEditor(props: AchievementEditorProps) {
  const { achievementDict, achievementModalDict } = props;

  // TODO: templates should be declared in some constant file
  const newAchievement: AchievementItem = {
    id: Object.keys(achievementDict).length,
    title: '',
    ability: AchievementAbility.ACADEMIC,
    isTask: true,
    status: AchievementStatus.ACTIVE,
    completionGoal: 0
  };

  // TODO: templates should be declared in some constant file
  const newModal: AchievementModalItem = {
    id: 1,
    title: '',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
    description: 'Cookies!',
    exp: 200,
    goalText: 'Complete Beyond the Second Dimension & Colorful Carpet missions.',
    completionText: 'Cooooookiess!!!'
  };

  return (
    <div className="main">
      <ul className="display-list">
        {Object.values(achievementDict).map(achievement => (  // TODO: write map function for this, similar to Achievement.tsx
          <li key={achievement.title}>
            <EditableAchievementCard
              achievement={achievement}
              modal={
                achievementModalDict[achievement.id] === undefined  // TODO: logic should be done by subcomponent
                  ? newModal
                  : achievementModalDict[achievement.id]
              }
            />
          </li>
        ))}
        <EditableAchievementCard achievement={newAchievement} modal={newModal} /> {/* TODO: create editor tool for this */}
      </ul>
    </div>
  );
}

export default AchievementEditor;
