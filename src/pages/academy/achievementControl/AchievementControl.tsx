import React, { useState } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';
import { achievementData } from '../../../commons/mocks/AchievementMocks';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleAchievementsUpdate: (achievementData: AchievementItem[]) => void;
};

export type StateProps = {
  achievementItems: AchievementItem[];
};

function AchievementControl(props: DispatchProps & StateProps) {
  //const { handleAchievementsUpdate } = props;

  /* 
  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);
  */

  // force re-render the achievement-control page after updating the achievement items
  const [refresh, setRefresh] = useState<boolean>();
  const forceRefresh = () => setRefresh(!refresh);

  const uploadAchievementData = (achievementData: AchievementItem[]) => {
    //handleAchievementsUpdate(achievementData);
    console.log('Upload data');
    inferencer.logInfo();
    forceRefresh();
  };

  const inferencer = new Inferencer(achievementData);

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
