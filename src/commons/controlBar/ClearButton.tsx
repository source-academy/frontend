import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ClearButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplOutputClear: () => void;
};

type StateProps = {
  key: string;
};

export function ClearButton(props: ClearButtonProps) {
  return controlButton('Clear', IconNames.REMOVE, props.handleReplOutputClear);
}
