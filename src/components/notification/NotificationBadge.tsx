import { Intent, Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import * as React from 'react';
import { filterNotificationsById } from './NotificationHelpers';
import {
  Notification,
  NotificationFilterFunction,
  NotificationType,
  NotificationTypes
} from './notificationShape';

type OwnProps = {
  className?: string;
  disableHover?: boolean; // Set to true to disable popover content
  large?: boolean; // Set to true to use large style
  notificationFilter?: (notifications: Notification[]) => Notification[];
};

export type StateProps = {
  notifications: Notification[];
};

export type DispatchProps = {
  handleAcknowledgeNotifications: (withFilter?: NotificationFilterFunction) => void;
};

const NotificationBadge: React.SFC<OwnProps & StateProps & DispatchProps> = props => {
  const notifications = props.notificationFilter
    ? props.notificationFilter(props.notifications)
    : props.notifications;

  if (!notifications.length) {
    return null;
  }

  const notificationIcon = (
    <Tag intent={Intent.DANGER} round={true} large={props.large}>
      {notifications.length}
    </Tag>
  );

  if (!props.disableHover) {
    const makeNotificationTag = (notification: Notification) => {
      const onRemove = () =>
        props.handleAcknowledgeNotifications(filterNotificationsById(notification.id));

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

    const notificationTags = <div className="col">{notifications.map(makeNotificationTag)}</div>;

    return (
      <Popover
        className={props.className}
        content={notificationTags}
        interactionKind={PopoverInteractionKind.HOVER}
        position={Position.RIGHT}
        hoverOpenDelay={50}
        hoverCloseDelay={50}
        lazy={true}
      >
        {notificationIcon}
      </Popover>
    );
  }

  return notificationIcon;
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

export default NotificationBadge;
