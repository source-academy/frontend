import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import { achievementData } from '../../../commons/mocks/AchievementMocks';
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
  const _inferencer = new Inferencer(achievementData);

  _inferencer.logInfo();

  return (
    <div className="AchievementControl">
      <AchievementControlPanel />

      <AchievementEditor inferencer={_inferencer} />
    </div>
  );
}

export default AchievementControl;
