import { IconNames } from '@blueprintjs/icons';

import { controlButton } from '../../commons';

export type ClearButtonProps = {
  handleReplOutputClear: () => void;
  key: string;
};

export function ClearButton(props: ClearButtonProps) {
  return controlButton('Clear', IconNames.REMOVE, props.handleReplOutputClear);
}
