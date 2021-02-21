import { GoalDefinition, GoalProgress, GoalType } from './AchievementTypes';

export const backendifyGoalDefinition = (goal: GoalDefinition) => ({
  maxXp: goal.meta.type === GoalType.ASSESSMENT ? 0 : goal.meta.maxXp,
  meta: goal.meta,
  text: goal.text,
  type: goal.meta.type,
  uuid: goal.uuid
});

export const backendifyGoalProgress = (goal: GoalProgress) => ({
  ...goal,
  uuid: goal.uuid
});

export const convertBackendMetaToFrontend = (meta: any) => {
  if (meta.type === "Binary" || meta.type === "Manual") {
    meta.maxXp = meta.max_xp;
    delete meta.max_xp;
  } else if (meta.type === "Assessment") {
    meta.assessmentNumber = meta.assessment_number;
    delete meta.assessment_number;
    meta.requiredCompletionFrac = meta.required_completion_frac;
    delete meta.required_completion_frac;
  }
  return meta;
}