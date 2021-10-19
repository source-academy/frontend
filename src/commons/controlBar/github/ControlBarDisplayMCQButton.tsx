import { IconNames } from '@blueprintjs/icons';

import controlButton from '../../ControlButton';

type ControlBarDisplayMCQButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  displayMCQInEditor: () => void;
  displayTextInEditor: () => void;
};

type StateProps = {
  mcqDisplayed: boolean;
  key: string;
};

export const ControlBarDisplayMCQButton: React.FC<ControlBarDisplayMCQButtonProps> = props => {
  const label = props.mcqDisplayed ? 'Show MCQ Text' : 'Hide MCQ Text';
  const behaviour = props.mcqDisplayed ? props.displayTextInEditor : props.displayMCQInEditor;

  return controlButton(label, IconNames.REFRESH, behaviour);
};
