import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { achievementData } from 'src/commons/mocks/AchievementMocks';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievements: AchievementItem[]) => void;
};

export type StateProps = {
  achievementItems: AchievementItem[];
};

function AchievementControl(props: DispatchProps & StateProps) {
  /* 
  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);
  */

  const inferencer = new Inferencer(achievementData);

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel />

        <AchievementEditor inferencer={inferencer} />
      </div>
    </>
  );
}

export default AchievementControl;
