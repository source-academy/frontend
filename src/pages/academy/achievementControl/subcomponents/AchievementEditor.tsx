import React from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import AddAchievementButton from './editorTools/editableUtils/AddAchievementButton';

type AchievementEditorProps = {
  inferencer: Inferencer;
  uploadAchievementData: any;
  forceRefresh: any;
  addAchievement: any;
  editAchievement: any;
  handleAchievementsUpdate: any;
};

function AchievementEditor(props: AchievementEditorProps) {
  const {
    inferencer,
    uploadAchievementData,
    forceRefresh,
    addAchievement,
    editAchievement,
    handleAchievementsUpdate
  } = props;

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
        handleAchievementsUpdate={handleAchievementsUpdate}
        forceRefresh={forceRefresh}
      />
    ));

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <AddAchievementButton
          inferencer={inferencer}
          forceRefresh={forceRefresh}
          addAchievement={addAchievement}
        />
      </div>
    </div>
  );
}

export default AchievementEditor;
