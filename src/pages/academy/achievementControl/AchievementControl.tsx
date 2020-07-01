import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    handleFetchAchievements();

    if (unsavedChanges !== 0) {
      window.onbeforeunload = () => true;
    }

    if (unsavedChanges === 0) {
      window.onbeforeunload = null;
    }
  }, [handleFetchAchievements, unsavedChanges]);

  const addUnsavedChange = () => setUnsavedChanges(unsavedChanges + 1);
  const removeUnsavedChange = () => setUnsavedChanges(unsavedChanges - 1);

  const updateAchievements = () => {
    handleUpdateAchievements(inferencer.getAchievements());
  };

  const editAchievement = (achievement: AchievementItem) => {
    handleEditAchievement(achievement);
  };

  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
          inferencer={inferencer}
          updateAchievements={updateAchievements}
          forceRender={forceRender}
          isDisabled={unsavedChanges !== 0}
        />

        <AchievementEditor
          inferencer={inferencer}
          updateAchievements={updateAchievements}
          editAchievement={editAchievement}
          forceRender={forceRender}
          addUnsavedChange={addUnsavedChange}
          removeUnsavedChange={removeUnsavedChange}
        />
      </div>
    </>
  );
}

export default AchievementControl;
