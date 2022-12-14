import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import ControlButton from '../ControlButton';

type ControlBarEvalButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplEval: () => void;
};

type StateProps = {
  isRunning: boolean;
  key: string;
};

export function ControlBarEvalButton(props: ControlBarEvalButtonProps) {
  return props.isRunning ? null : (
    <Tooltip2 content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={props.handleReplEval} />
    </Tooltip2>
  );
}
