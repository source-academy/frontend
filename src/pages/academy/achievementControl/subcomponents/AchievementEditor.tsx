import React, { useState } from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementEditorProps = {
  inferencer: Inferencer;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer } = props;
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleSaveChanges = (achievement: AchievementItem) => {
    inferencer.setItem(achievement);
    inferencer.logInfo();
    setHasChanges(!hasChanges);
  };
  /*
  const handleUploadChanges = () => {
    // bind action?
  }
*/
  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        setHasChanges={setHasChanges}
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
