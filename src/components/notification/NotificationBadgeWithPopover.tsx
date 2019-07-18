import { Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import * as React from 'react';
import NotificationBadge from './NotificationBadge';
import { Notification, NotificationType, NotificationTypes } from './notificationShape';

export type DispatchProps = {
  handleAcknowledgeNotifications: (notificationIds: number[]) => void;
};

type OwnProps = {
  className?: string;
  large?: boolean; // enable to use large style
  notifications: Notification[];
};

const makeNotificationMessage = (type: NotificationType) => {
  switch (type) {
    case NotificationTypes.new:
      return 'This assessment is new.';
    case NotificationTypes.deadline:
      return 'This assessment is closing soon.';
    case NotificationTypes.autograded:
      return 'This assessment has been autograded.';
    case NotificationTypes.submitted:
      return 'This submission is new.';
    case NotificationTypes.unsubmitted:
      return 'This assessment has been unsubmitted.';
    case NotificationTypes.graded:
      return 'This assessment has been manually graded.';
    case NotificationTypes.new_message:
      return 'There are new messages.';
    default:
      return 'Unknown notification';
  }
};

const NotificationBadgeWithPopover: React.SFC<OwnProps & DispatchProps> = props => {
  if (!props.notifications.length) {
    return null;
  }

  const makeNotificationTags = (notifications: Notification[]) => (
    <div className="col">{notifications.map(makeNotificationTag)}</div>
  );

  const makeNotificationTag = (notification: Notification) => {
    const onRemove = () => props.handleAcknowledgeNotifications([notification.id]);

    return (
      <Tag
        className="row badge-tag"
        key={`${notification.id}`}
        minimal={true}
        multiline={true}
        onRemove={onRemove}
      >
        {makeNotificationMessage(notification.type)}
      </Tag>
    );
  };

  return (
    <Popover
      className={props.className}
      content={makeNotificationTags(props.notifications)}
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.RIGHT}
    >
      <NotificationBadge large={true} number={props.notifications.length} />
    </Popover>
  );
};

export default NotificationBadgeWithPopover;
