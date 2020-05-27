import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';

type RunButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorEval: () => void;
};

type StateProps = {
  key: string;
};

export function RunButton(props: RunButtonProps) {
  return (
    <Tooltip content="...or press shift-enter in the editor">
      {controlButton('Run', IconNames.PLAY, props.handleEditorEval)}
    </Tooltip>
  );
}
