import React, { useState } from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import AchievementAdder from './editorTools/editableUtils/AchievementAdder';

type AchievementEditorProps = {
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer, updateAchievements, editAchievement } = props;

  const [adderId, setAdderId] = useState<number>(-1);

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
        adderId={adderId}
        setAdderId={setAdderId}
      />
    ));

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <AchievementAdder
          key={-1}
          inferencer={inferencer}
          adderId={adderId}
          setAdderId={setAdderId}
        />
      </div>
    </div>
  );
}

export default AchievementEditor;
