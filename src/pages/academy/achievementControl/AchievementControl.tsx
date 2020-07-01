import React, { useEffect } from 'react';
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

  useEffect(() => {
    handleFetchAchievements();
  }, [handleFetchAchievements]);

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
        />

        <AchievementEditor
          inferencer={inferencer}
          updateAchievements={updateAchievements}
          editAchievement={editAchievement}
        />
      </div>
    </>
  );
}

export default AchievementControl;
