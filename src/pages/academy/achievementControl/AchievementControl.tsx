import React, { useState /* useEffect */ } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';
import {
  mockAchievementData,
  updateMockAchievementData
} from '../../../commons/mocks/AchievementMocks';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievementData: AchievementItem[]) => void;
};

export type StateProps = {
  achievementData: AchievementItem[];
};

function AchievementControl(props: DispatchProps & StateProps) {
  /* TODO: Uncomment before Production
  const { handleAchievementsFetch, handleAchievementsUpdate, achievementItems } = props;

  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);

  */

  // force re-render the achievement-control page after updating the achievement items
  const [refresh, setRefresh] = useState<boolean>();
  const forceRefresh = () => setRefresh(!refresh);

  const uploadAchievementData = (achievementData: AchievementItem[]) => {
    updateMockAchievementData(achievementData); // TODO: replace with handleAchievementsUpdate(achievementData);
    forceRefresh();
  };

  const inferencer = new Inferencer(mockAchievementData);

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
          inferencer={inferencer}
          uploadAchievementData={uploadAchievementData}
        />

        <AchievementEditor
          inferencer={inferencer}
          uploadAchievementData={uploadAchievementData}
          forceRefresh={forceRefresh}
        />
      </div>
    </>
  );
}

export default AchievementControl;
