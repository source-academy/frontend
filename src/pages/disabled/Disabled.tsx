import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';

interface DisabledProps {
  reason?: string;
}

const Disabled: React.FC<DisabledProps> = ({ reason }) => (
  <div className={classNames('NoPage', Classes.DARK)}>
    <NonIdealState
      icon={IconNames.ERROR}
      title="Disabled"
      description={`The Source Academy has been disabled${
        reason ? ` for this reason: ${reason}` : ''
      }.`}
    />
  </div>
);

export default Disabled;
