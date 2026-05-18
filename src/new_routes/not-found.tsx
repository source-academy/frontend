import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

function NotFound() {
  return (
    <div className={classNames('NoPage', Classes.DARK)} data-testid="NotFound-Component">
      <NonIdealState
        icon={IconNames.ERROR}
        title="404 Not Found"
        description="The requested resource could not be found"
      />
    </div>
  );
}

export const Component = NotFound;
