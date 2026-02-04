import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import AchievementPreview from '../../../commons/achievement/control/AchievementPreview';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { Prompt } from '../../../commons/ReactRouterPrompt';
import AchievementActions from '../../../features/achievement/AchievementActions';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import { AchievementItem, GoalDefinition } from '../../../features/achievement/AchievementTypes';

const AchievementControl: React.FC = () => {
  const dispatch = useDispatch();
  const {
    handleBulkUpdateAchievements,
    handleBulkUpdateGoals,
    handleGetAchievements,
    handleGetOwnGoals,
    handleRemoveAchievement,
    handleRemoveGoal
  } = useMemo(
    () => ({
      handleBulkUpdateAchievements: (achievement: AchievementItem[]) =>
        dispatch(AchievementActions.bulkUpdateAchievements(achievement)),
      handleBulkUpdateGoals: (goals: GoalDefinition[]) =>
        dispatch(AchievementActions.bulkUpdateGoals(goals)),
      handleGetAchievements: () => dispatch(AchievementActions.getAchievements()),
      handleGetOwnGoals: () => dispatch(AchievementActions.getOwnGoals()),
      handleRemoveAchievement: (uuid: string) =>
        dispatch(AchievementActions.removeAchievement(uuid)),
      handleRemoveGoal: (uuid: string) => dispatch(AchievementActions.removeGoal(uuid))
    }),
    [dispatch]
  );

  const [initialAchievements, initialGoals] = useTypedSelector(state => [
    state.achievement.achievements,
    state.achievement.goals
  ]);
  const inferencer = useMemo(
    () => new AchievementInferencer(initialAchievements, initialGoals),
    [initialAchievements, initialGoals]
  );

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    handleGetAchievements();
    handleGetOwnGoals();
  }, [handleGetAchievements, handleGetOwnGoals]);

  /**
   * Monitors changes that are awaiting publish
   */
  const [awaitPublish, setAwaitPublish] = useState(false);
  const publishChanges = () => {
    // NOTE: Goals and achievements must exist in the backend before the association can be built
    handleBulkUpdateGoals(inferencer.getAllGoals());
    handleBulkUpdateAchievements(inferencer.getAllAchievements());
    inferencer.getGoalsToDelete().forEach(handleRemoveGoal);
    inferencer.getAchievementsToDelete().forEach(handleRemoveAchievement);
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
};

export default AchievementControl;
