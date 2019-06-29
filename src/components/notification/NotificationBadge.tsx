import { Intent, Tag, Tooltip } from '@blueprintjs/core';
import * as React from 'react';
import { AcademyNotification } from './notificationShape';

type OwnProps = {
  notifications: AcademyNotification[];
};

export const NotificationBadge: React.SFC<OwnProps> = props => (
  <Tooltip content="asdafasd">
    <Tag
      style={{
        padding: 0
      }}
      intent={Intent.DANGER}
      round={true}
    >
      {props.notifications.length}
    </Tag>
  </Tooltip>
);
