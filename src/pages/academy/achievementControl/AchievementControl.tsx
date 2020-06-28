import React, { useState /* useEffect */ } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';
import {
  updateMockAchievements,
  fetchMockAchievements
} from '../../../commons/mocks/AchievementMocks';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievements: AchievementItem[]) => void;
  addAchievement: (achievement: AchievementItem) => void;
  editAchievement: (achievement: AchievementItem) => void;
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
    handleAchievementsUpdate
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

  const uploadAchievements = (achievements: AchievementItem[]) => {
    updateMockAchievements(achievements); // TODO: replace with handleAchievementsUpdate(achievements);
    const refreshData = fetchMockAchievements(); // TODO: replace with handleAchievementFetch()
    _inferencer = new Inferencer(refreshData);
    forceRefresh();
  };

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
          inferencer={_inferencer}
          uploadAchievements={uploadAchievements}
          editAchievement={editAchievement}
        />

        <AchievementEditor
          inferencer={_inferencer}
          uploadAchievements={uploadAchievements}
          forceRefresh={forceRefresh}
          addAchievement={addAchievement}
          editAchievement={editAchievement}
          handleAchievementsUpdate={handleAchievementsUpdate}
        />
      </div>
    </>
  );
}

export default AchievementControl;
