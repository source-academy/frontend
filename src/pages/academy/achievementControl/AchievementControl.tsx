import React, { useState, useEffect } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';

export type DispatchProps = {
  handleFetchAchievements: () => void;
  handleUpdateAchievements: (achievements: AchievementItem[]) => void;
  handleEditAchievement: (achievement: AchievementItem) => void;
};

export type StateProps = {
  inferencer: Inferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    handleFetchAchievements,
    handleUpdateAchievements,
    handleEditAchievement
  } = props;

  const [unsavedChanges, setUnsavedChanges] = useState<number>(0);

  const addUnsavedChange = () => setUnsavedChanges(unsavedChanges + 1);
  const removedUnsavedChange = () => setUnsavedChanges(unsavedChanges - 1);

  useEffect(() => {
    handleFetchAchievements();

    if (unsavedChanges !== 0) {
      window.onbeforeunload = () => true;
    }

    if (unsavedChanges === 0) {
      window.onbeforeunload = null;
    }
  }, [handleFetchAchievements, unsavedChanges]);

  const updateAchievements = () => {
    handleUpdateAchievements(inferencer.getAchievements());
  };

  const editAchievement = (achievement: AchievementItem) => {
    handleEditAchievement(achievement);
  };

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
          inferencer={inferencer}
          updateAchievements={updateAchievements}
          editAchievement={editAchievement}
        />

        <AchievementEditor
          inferencer={inferencer}
          updateAchievements={updateAchievements}
          editAchievement={editAchievement}
          addUnsavedChange={addUnsavedChange}
          removedUnsavedChange={removedUnsavedChange}
        />
      </div>
    </>
  );
}

export default AchievementControl;
