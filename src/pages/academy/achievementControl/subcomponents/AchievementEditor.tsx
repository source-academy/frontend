import React from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';

type AchievementEditorProps = {
  inferencer: Inferencer;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer } = props;

  const handleSaveChanges = () => console.log('Save function not implemented!');

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        saveChanges={handleSaveChanges}
      />
    ));

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
      </div>
    </div>
  );
}

export default AchievementEditor;
