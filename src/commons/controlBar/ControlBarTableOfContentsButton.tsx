import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlButtonTableOfContentsButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleOpenToc: () => void;
};

export function ControlBarTableOfContentsButton(props: ControlButtonTableOfContentsButtonProps) {
  return (
      controlButton('Table of Contents', IconNames.MENU, props.handleOpenToc)
  );
}
