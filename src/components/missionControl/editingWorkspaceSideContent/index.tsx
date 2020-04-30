import AutograderTab from './AutograderTab';
import DeploymentTab from './DeploymentTab';
import GradingTab from './GradingTab';
import ManageQuestionTab from './ManageQuestionTab';
import MCQQuestionTemplateTab from './MCQQuestionTemplateTab';
import ProgrammingQuestionTemplateTab from './ProgrammingQuestionTemplateTab';
import TextareaContentTab from './TextareaContent';

export {
  AutograderTab,
  DeploymentTab,
  GradingTab,
  ManageQuestionTab,
  MCQQuestionTemplateTab,
  ProgrammingQuestionTemplateTab,
  TextareaContentTab
};

export const getValueFromPath = (path: Array<string | number>, obj: any): any => {
  for (const next of path) {
    obj = obj[next];
  }
  return obj;
};

export const assignToPath = (path: Array<string | number>, value: any, obj: any): void => {
  let i = 0;
  for (i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
};

export const limitNumberRange = (min: number | null = 0, max: number | null = null) => (
  value: number
): number => {
  let result;
  if (min !== null && value < min) {
    result = min;
  } else if (max !== null && value > max) {
    result = max;
  } else {
    result = value;
  }
  return result;
};
