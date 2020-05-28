import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarClearButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplOutputClear: () => void;
};

type StateProps = {
  key: string;
};

export function ControlBarClearButton(props: ControlBarClearButtonProps) {
  return controlButton('Clear', IconNames.REMOVE, props.handleReplOutputClear);
}
