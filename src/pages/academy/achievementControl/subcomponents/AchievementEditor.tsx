import React from 'react';

import EditableAchievementCard from './editorTools/EditableAchievementCard';
import { achievementTemplate } from './editorTools/EditableTemplates';
import EditableAchievementAdder from './editorTools/EditableAchievementAdder';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';

type AchievementEditorProps = {
  inferencer: Inferencer;
};

function AchievementEditor(props: AchievementEditorProps) {
  const { inferencer } = props;

  const mapAchievementIdsToEditableCard = (achievementIds: number[]) =>
    achievementIds.map(id => <EditableAchievementCard key={id} id={id} inferencer={inferencer} />);

  const addNewCard = () => {
    inferencer.insertAchievement(achievementTemplate);
  };

  return (
    <div className="editor-cards">
      <div className="main">
        <ul className="display-list">{mapAchievementIdsToEditableCard(inferencer.listIds())}</ul>
        <EditableAchievementAdder addNewCard={addNewCard} />
      </div>
    </div>
  );
}

export default AchievementEditor;
