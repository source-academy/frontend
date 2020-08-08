import React, { useEffect, useState } from 'react';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import AchievementPreview from '../../../commons/achievement/control/AchievementPreview';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { AchievementItem, GoalDefinition } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  handleBulkUpdateAchievements: (achievements: AchievementItem[]) => void;
  handleBulkUpdateGoals: (goals: GoalDefinition[]) => void;
  handleGetAchievements: () => void;
  handleGetOwnGoals: () => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    handleBulkUpdateAchievements,
    handleGetAchievements,
    handleGetOwnGoals
  } = props;

  /**
   * The control fetches the latest achievements and goals from backend
   * when the page is rendered
   */
  useEffect(() => {
    if (Constants.useBackend) {
      handleGetAchievements();
      handleGetOwnGoals();
    }
    console.log('fetch achievements');
    console.log('fetch goals');
  }, [handleGetAchievements, handleGetOwnGoals]);

  // TODO: <Prompt />

  /**
   * Publish state monitors changes that are awaiting publish
   */
  const publishState = useState<boolean>(false);

  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <div className="AchievementControl">
      <AchievementPreview
        inferencer={inferencer}
        publishState={publishState}
        publishAchievements={handleBulkUpdateAchievements}
      />

      <AchievementEditor
        inferencer={inferencer}
        publishState={publishState}
        forceRender={forceRender}
      />

      <GoalEditor />
    </div>
  );
}

export default AchievementControl;
