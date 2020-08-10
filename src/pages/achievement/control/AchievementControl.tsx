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
  // TODO: useContext for inferencer
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    handleBulkUpdateAchievements,
    handleBulkUpdateGoals,
    handleGetAchievements,
    handleGetOwnGoals,
    inferencer
  } = props;

  /**
   * The latest achievements and goals from backend are fetched when the page is rendered
   */
  useEffect(() => {
    if (Constants.useBackend) {
      handleGetAchievements();
      handleGetOwnGoals();
    }
  }, [handleGetAchievements, handleGetOwnGoals]);

  // TODO: <Prompt />

  /**
   * Monitors changes that are awaiting publish
   */
  const publishState = useState<boolean>(false);
  const [, setAwaitPublish] = publishState;
  const requestPublish = () => setAwaitPublish(true);

  /**
   * Allows child components to trigger a page render so that the AchievementPreview
   * displays the latest local changes
   */
  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <div className="AchievementControl">
      <AchievementPreview
        inferencer={inferencer}
        publishAchievements={handleBulkUpdateAchievements}
        publishGoals={handleBulkUpdateGoals}
        publishState={publishState}
      />

      <AchievementEditor
        inferencer={inferencer}
        forceRender={forceRender}
        requestPublish={requestPublish}
      />

      <GoalEditor />
    </div>
  );
}

export default AchievementControl;
