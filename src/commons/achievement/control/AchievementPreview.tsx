import React, { useState } from 'react';
import { getAbilityGlow } from 'src/features/achievement/AchievementConstants';
import { AchievementAbility, FilterStatus } from 'src/features/achievement/AchievementTypes';

import AchievementTask from '../AchievementTask';
import AchievementInferencer from '../utils/AchievementInferencer';

type AchievementPreviewProps = {
  inferencer: AchievementInferencer;
};

function AchievementPreview(props: AchievementPreviewProps) {
  const { inferencer } = props;

  // If an achievement is focused, the cards glow and dashboard displays the AchievementView
  const [focusId, setFocusId] = useState<number>(-1);

  /**
   * Make focused achievement glow and Flex achievements permanently glowing
   *
   * @param id achievementId
   */
  const handleGlow = (id: number) => {
    const ability = inferencer.getAchievementItem(id).ability;
    return ability === AchievementAbility.FLEX || id === focusId
      ? getAbilityGlow(ability)
      : undefined;
  };

  /**
   * Maps an array of achievementId to <AchievementTask /> component
   *
   * @param taskIds an array of achievementId
   */
  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={FilterStatus.ALL}
        setFocusId={setFocusId}
        handleGlow={handleGlow}
      />
    ));

  return (
    <div className="achievement-preview">
      <div className="title">
        <h1>Achievement Preview</h1>
      </div>
      <ul className="task-container">
        {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
      </ul>
    </div>
  );
}

export default AchievementPreview;
