import React, { useEffect } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievements: AchievementItem[]) => void;
};

export type StateProps = {
  achievementItems: AchievementItem[];
};

function AchievementControl(props: DispatchProps & StateProps) {
  const { handleAchievementsFetch, achievementItems } = props;

  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);

  const _inferencer = new Inferencer(achievementItems);

  _inferencer.logInfo();

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel />

        <AchievementEditor inferencer={_inferencer} />
      </div>
    </>
  );
}

export default AchievementControl;
