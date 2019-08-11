import { IconNames } from '@blueprintjs/icons';

import { controlButton } from '../../commons';

export type ResetButtonProps = {
  key: string;
  onClick?(): any;
};

export function ResetButton(props: ResetButtonProps) {
  return controlButton('Reset', IconNames.REPEAT, props.onClick);
}
