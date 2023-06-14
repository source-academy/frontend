import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { useLoaderData } from 'react-router';

interface DisabledProps {
  reason?: string;
}

const Disabled: React.FC<DisabledProps> = () => {
  const disabledReason = useLoaderData() as string | undefined;

  return (
    <div className={classNames('NoPage', Classes.DARK)}>
      <NonIdealState
        icon={IconNames.ERROR}
        title="Disabled"
        description={`The Source Academy has been disabled${
          disabledReason ? ` for this reason: ${disabledReason}` : ''
        }.`}
      />
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Disabled;
Component.displayName = 'Disabled';

export default Disabled;
