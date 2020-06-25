import React, { useState } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';
import {
  updateMockAchievementData,
  fetchMockAchievementData
} from '../../../commons/mocks/AchievementMocks';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievementData: AchievementItem[]) => void;
};

export type StateProps = {
  inferencer: Inferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const { inferencer } = props;

  let _inferencer: Inferencer = inferencer;

  // force re-render the achievement-control page
  const [refresh, setRefresh] = useState<boolean>();
  const forceRefresh = () => {
    setRefresh(!refresh);
  };

  const uploadAchievementData = (achievementData: AchievementItem[]) => {
    updateMockAchievementData(achievementData); // TODO: replace with handleAchievementsUpdate(achievementData);
    const refreshData = fetchMockAchievementData(); // TODO: replace with handleAchievementFetch()
    _inferencer = new Inferencer(refreshData);
    forceRefresh();
  };

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
          inferencer={_inferencer}
          uploadAchievementData={uploadAchievementData}
        />

        <AchievementEditor
          inferencer={_inferencer}
          uploadAchievementData={uploadAchievementData}
          forceRefresh={forceRefresh}
        />
      </div>
    </>
  );
}

export default AchievementControl;
