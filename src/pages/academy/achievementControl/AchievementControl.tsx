import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import { achievementData } from '../../../commons/mocks/AchievementMocks';
import Inferencer from '../achievements/subcomponents/utils/Inferencer';

export type DispatchProps = {};

export type StateProps = {};

function AchievementControl() {
  const _inferencer = new Inferencer(achievementData);
  _inferencer.logInfo();

  return (
    <div className="AchievementControl">
      <AchievementControlPanel inferencer={_inferencer} />

      <AchievementEditor inferencer={_inferencer} />
    </div>
  );
}

export default AchievementControl;
