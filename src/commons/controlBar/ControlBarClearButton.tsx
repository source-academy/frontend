import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  handleReplOutputClear: () => void;
};

function ControlBarClearButton({ handleReplOutputClear }: Props) {
  return <ControlButton label="Clear" icon={IconNames.REMOVE} onClick={handleReplOutputClear} />;
}

export default ControlBarClearButton;
