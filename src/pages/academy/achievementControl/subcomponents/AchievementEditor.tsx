import React, { useState } from 'react';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: Inferencer;
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
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <AchievementAdder inferencer={inferencer} adderId={adderId} setAdderId={setAdderId} />
      </div>
    </div>
  );
}

export default AchievementEditor;
