import React, { useState /* useEffect */ } from 'react';
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
  addAchievement: (achievement: AchievementItem) => void;
  editAchievement: (achievement: AchievementItem) => void;
  deleteAchievement: (achievement: AchievementItem) => void;
};

export type StateProps = {
  inferencer: Inferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    // handleAchievementsFetch,
    addAchievement,
    editAchievement,
    deleteAchievement
  } = props;

  /* TODO: Implement 
  useEffect(() => {
    handleAchievementsFetch();
  }, [ handleAchievementsFetch ]);
  */

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
          editAchievement={editAchievement}
        />

        <AchievementEditor
          inferencer={_inferencer}
          uploadAchievementData={uploadAchievementData}
          forceRefresh={forceRefresh}
          addAchievement={addAchievement}
          editAchievement={editAchievement}
          deleteAchievement={deleteAchievement}
        />
      </div>
    </>
  );
}

export default AchievementControl;
