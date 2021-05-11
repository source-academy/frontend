import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

export type ControlBarTaskAddButtonProps = {
  addNewQuestion: () => void;
};

export const ControlBarTaskAddButton: React.FC<ControlBarTaskAddButtonProps> = props => {
  return controlButton('Add Task', IconNames.ADD, props.addNewQuestion);
};
