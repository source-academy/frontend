import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarTableOfContentsButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleOpenToc: () => void;
};

export function ControlBarTableOfContentsButton(props: ControlBarTableOfContentsButtonProps) {
  return controlButton('Table of Contents', IconNames.MENU, props.handleOpenToc);
}
