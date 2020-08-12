import React, { useEffect, useState } from 'react';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import AchievementPreview from '../../../commons/achievement/control/AchievementPreview';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
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

  const achievements = inferencer.getAllAchievement();
  const goals = inferencer.getAllGoalDefinition();

  // TODO: <Prompt />

  /**
   * Monitors changes that are awaiting publish
   */
  const publishState = useState<boolean>(false);
  const [awaitPublish, setAwaitPublish] = publishState;
  const handlePublish = () => {
    // NOTE: Update goals first because goals must exist before their ID can be specified in achievements
    handleBulkUpdateGoals(goals);
    handleBulkUpdateAchievements(achievements);
    setAwaitPublish(false);
  };
  const requestPublish = () => setAwaitPublish(true);

  /**
   * Allows editor components to trigger a page re-render so that the AchievementPreview
   * displays the latest local changes
   *
   * NOTE: AchievementContext should be able to observe the changes in the inferencer
   * and automatically trigger a re-render in all child components. However, in
   * <EditableAchievementCard /> modifying an achievement is done by calling
   * inferencer.modifyAchievement() instead of using useState hooks recommended by React.
   * Hence the AchievementContext is unaware of the changes and a forceRender() is needed.
   *
   * TODO: Refactor the <EditableAchievementCard /> workflow and deprecate forceRender()
   */
  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <AchievementContext.Provider value={inferencer}>
      <div className="AchievementControl">
        <AchievementPreview awaitPublish={awaitPublish} handlePublish={handlePublish} />

        <AchievementEditor forceRender={forceRender} requestPublish={requestPublish} />

        <GoalEditor />
      </div>
    </AchievementContext.Provider>
  );
}

export default AchievementControl;
