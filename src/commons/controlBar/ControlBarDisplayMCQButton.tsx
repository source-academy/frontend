import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarDisplayMCQButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  displayMCQInEditor: () => void;
  displayTextInEditor: () => void;
};

type StateProps = {
  key: string;
  mcqDisplayed: boolean;
};

export const ControlBarDisplayMCQButton: React.FC<ControlBarDisplayMCQButtonProps> = props => {
  const displayText = props.mcqDisplayed ? 'Show Text' : 'Show MCQ';
  const callback = props.mcqDisplayed ? props.displayTextInEditor : props.displayMCQInEditor;

  return controlButton(displayText, IconNames.REFRESH, callback);
};
