import DeploymentTab from './DeploymentTab';
import GradingTab from './GradingTab';
import ManageQuestionTab from './ManageQuestionTab';
import QuestionTemplateTab from './QuestionTemplateTab';
import TextareaContentTab from './TextareaContent';

export { DeploymentTab, GradingTab, ManageQuestionTab, QuestionTemplateTab, TextareaContentTab };

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
