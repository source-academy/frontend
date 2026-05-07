import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  handleReplOutputClear: () => void;
};

export const ControlBarClearButton: React.FC<Props> = ({ handleReplOutputClear }) => {
  return <ControlButton label="Clear" icon={IconNames.REMOVE} onClick={handleReplOutputClear} />;
};
