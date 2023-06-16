import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';

const NotFound: React.SFC<{}> = () => (
  <div className={classNames('NoPage', Classes.DARK)}>
    <NonIdealState
      icon={IconNames.ERROR}
      title="404 Not Found"
      description="The requested resource could not be found"
    />
  </div>
);

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = NotFound;
Component.displayName = 'NotFound';

export default NotFound;
