import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

export type ControlBarTaskDeleteButtonProps = {
  deleteCurrentQuestion: () => void;
};

export const ControlBarTaskDeleteButton: React.FC<ControlBarTaskDeleteButtonProps> = props => {
  return controlButton('Delete Current Task', IconNames.DELETE, props.deleteCurrentQuestion);
};
