import { NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

const NotFound: React.SFC<{}> = () => (
  <div className="NotFound pt-dark">
    <NonIdealState
      visual={IconNames.ERROR}
      title="404 Not Found"
      description="The requested resource could not be found"
    />
  </div>
);

export default NotFound;
