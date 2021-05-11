import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

export type ControlBarTaskAddButtonProps = {
  addNewQuestion: () => void;
  numberOfTasks: number;
  key: string;
};

export const ControlBarTaskAddButton: React.FC<ControlBarTaskAddButtonProps> = props => {
  return controlButton('Add Task', IconNames.ADD, props.addNewQuestion);
};
