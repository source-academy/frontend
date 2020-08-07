import React, { useState } from 'react';

import AchievementInferencer from '../utils/AchievementInferencer';
import EditableAchievementCard from './editorTools/EditableAchievementCard';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: AchievementInferencer;
  updateAchievements: any;
  editAchievement: any;
  forceRender: any;
  addUnsavedChange: any;
  removeUnsavedChange: any;
  removeGoal: any;
  removeAchievement: any;
};

function AchievementEditor(props: AchievementEditorProps) {
  const {
    inferencer,
    updateAchievements,
    editAchievement,
    forceRender,
    addUnsavedChange,
    removeUnsavedChange,
    removeGoal,
    removeAchievement
  } = props;

  /**
   * NOTE: This helps us to ensure that only ONE achievement is added
   * every time.
   *
   * Refering to AchievementAdder, if the adderId is -1, this
   * means that currently no achievement is being added and the admin is able to
   * add a new achievement.
   *
   * Alternatievly, if the adderId is not -1, this means that currently an achievement
   * is being added to the systen and the admin is not allowed to add two achievements
   * at one go.
   */
  const [adderId, setAdderId] = useState<number>(-1);

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
        forceRender={forceRender}
        adderId={adderId}
        setAdderId={setAdderId}
        addUnsavedChange={addUnsavedChange}
        removeUnsavedChange={removeUnsavedChange}
        removeGoal={removeGoal}
        removeAchievement={removeAchievement}
      />
    ));

  return (
    <div className="achievement-editor">
      <div className="achievement-command">
        <AchievementAdder inferencer={inferencer} adderId={adderId} setAdderId={setAdderId} />
      </div>
      <ul className="achievement-container">
        {mapAchievementIdsToEditableCard(inferencer.listIds())}
      </ul>
    </div>
  );
}

export default AchievementEditor;
