import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarShowDependenciesButtonProps = OwnProps;

type OwnProps = {
  key: string;
  buttonText: string;
  handleShowDependencies: () => void;
};

export function ControlBarShowDependenciesButton(props: ControlBarShowDependenciesButtonProps) {
  return controlButton(props.buttonText, IconNames.CODE, props.handleShowDependencies);
}
