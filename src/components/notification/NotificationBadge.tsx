import { Intent, Tag, Tooltip } from '@blueprintjs/core';
import * as React from 'react';
import { AcademyNotification } from './notificationShape';

type OwnProps = {
  notifications: AcademyNotification[];
};

export const NotificationBadge: React.SFC<OwnProps> = props => (
  <Tooltip content={makeNotificationTags(props.notifications)}>
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

const makeNotificationTags = (notifications: AcademyNotification[]) => (
  <div>
    {notifications.map(makeNotificationTag)}
  </div>
);

const makeNotificationTag = (notification: AcademyNotification) => (
  <Tag style={{padding: 0}}>
    {notification.type}
  </Tag>
);