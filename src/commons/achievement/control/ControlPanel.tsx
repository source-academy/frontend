import React, { useState } from 'react';
import { getAbilityGlow } from 'src/features/achievement/AchievementConstants';
import { AchievementAbility } from 'src/features/achievement/AchievementTypes';

import AchievementInferencer from '../utils/AchievementInferencer';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';

type ControlPanelProps = {
  inferencer: AchievementInferencer;
  updateAchievements: any;
  forceRender: any;
  isDisabled: boolean;

  pendingUpload: any;
  setPendingUpload: any;
  saveAchievementsToFrontEnd: any;
};

function ControlPanel(props: ControlPanelProps) {
  const {
    inferencer,
    updateAchievements,
    forceRender,
    isDisabled,
    pendingUpload,
    setPendingUpload,
    saveAchievementsToFrontEnd
  } = props;

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

  const handleSaveChanges = () => {
    setPendingUpload(true);
    saveAchievementsToFrontEnd(inferencer.getAchievements());
    forceRender();
  };

  const handleUploadChanges = () => {
    updateAchievements();
    setPendingUpload(false);
    forceRender();
  };

  /**
   * Maps an array of achievementId to <EditableAchievementTask /> component
   *
   * @param taskIds an array of achievementId
   */
  const mapAchievementIdsToEditableTask = (taskIds: number[]) =>
    taskIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        setFocusId={setFocusId}
        handleGlow={handleGlow}
        saveChanges={handleSaveChanges}
      />
    ));

  return (
    <div className="control-panel">
      <div className="command-buttons">
        <TaskAdder inferencer={inferencer} saveChanges={handleSaveChanges} />
        <TaskUploader pendingUpload={pendingUpload} uploadChanges={handleUploadChanges} />
      </div>
      <ul
        className="control-container"
        style={isDisabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}
      >
        {mapAchievementIdsToEditableTask(inferencer.listTaskIdsbyPosition())}
      </ul>
    </div>
  );
}

export default ControlPanel;
