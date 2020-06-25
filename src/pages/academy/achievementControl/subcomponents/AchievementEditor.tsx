import React from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import AddAchievementButton from './editorTools/editableUtils/AddAchievementButton';

type AchievementEditorProps = {
  inferencer: Inferencer;
  uploadAchievementData: any;
  forceRefresh: any;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer, uploadAchievementData, forceRefresh } = props;

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementCard
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
      />
    ));

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <AddAchievementButton inferencer={inferencer} forceRefresh={forceRefresh} />
      </div>
    </div>
  );
}

export default AchievementEditor;
