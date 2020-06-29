import React from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
  forceRefresh: any;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer, updateAchievements, editAchievement, forceRefresh } = props;

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />
    ));

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <AchievementAdder inferencer={inferencer} forceRefresh={forceRefresh} />
      </div>
    </div>
  );
}

export default AchievementEditor;
