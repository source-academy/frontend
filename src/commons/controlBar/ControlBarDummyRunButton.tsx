import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

export function ControlBarDummyRunButton() {
  return (
    <Tooltip2>
      <Button icon="play" className="WaitingCursor">
        Run
      </Button>
    </Tooltip2>
  );
}
