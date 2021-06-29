import { useEffect, useReducer, useState } from 'react';
import { Prompt } from 'react-router';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import AchievementPreview from '../../../commons/achievement/control/AchievementPreview';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import { AchievementItem, GoalDefinition } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  bulkUpdateAchievements: (achievements: AchievementItem[]) => void;
  bulkUpdateGoals: (goals: GoalDefinition[]) => void;
  getAchievements: () => void;
  getOwnGoals: () => void;
  removeAchievement: (uuid: string) => void;
  removeGoal: (uuid: string) => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    bulkUpdateAchievements,
    bulkUpdateGoals,
    getAchievements,
    getOwnGoals,
    removeAchievement,
    removeGoal,
    inferencer
  } = props;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    getAchievements();
    getOwnGoals();
  }, [getAchievements, getOwnGoals]);

  /**
   * Monitors changes that are awaiting publish
   */
  const [awaitPublish, setAwaitPublish] = useState<boolean>(false);
  const publishChanges = () => {
    // NOTE: Goals and achievements must exist in the backend before the association can be built
    bulkUpdateGoals(inferencer.getAllGoals());
    bulkUpdateAchievements(inferencer.getAllAchievements());
    inferencer.getGoalsToDelete().forEach(removeGoal);
    inferencer.getAchievementsToDelete().forEach(removeAchievement);
    inferencer.resetToDelete();
    setAwaitPublish(false);
  };
  const requestPublish = () => {
    setAwaitPublish(true);
    forceUpdate();
  };

  /**
   * Allows editor components to trigger a page re-render whenever the inferencer is modified
   * so that the AchievementPreview displays the latest local changes
   *
   * NOTE: Although the inferencer is passed to the value prop of AchievementContext.Provider,
   * changes to the inferencer does not trigger a re-render in all AchievementContext.Consumer
   * as expected because Context uses reference identity to determine when to re-render. When
   * the editor components update the inferencer by calling inferencer.modifyAchievement(...)
   * or inferencer.modifyGoalDefinition(...), the Context does not register the changes hence
   * a forceUpdate() hook is needed.
   *
   * See: https://reactjs.org/docs/context.html#caveats
   */
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  return (
    <AchievementContext.Provider value={inferencer}>
      <Prompt
        message="You have unpublished changes. Are you sure you want to leave?"
        when={awaitPublish}
      />

      <div className="AchievementControl">
        <AchievementPreview awaitPublish={awaitPublish} publishChanges={publishChanges} />

        <AchievementEditor requestPublish={requestPublish} />

        <GoalEditor requestPublish={requestPublish} />
      </div>
    </AchievementContext.Provider>
  );
}

export default AchievementControl;
