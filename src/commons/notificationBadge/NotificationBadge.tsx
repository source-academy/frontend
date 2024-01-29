import { Intent, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { useDispatch } from 'react-redux';

import { acknowledgeNotifications } from '../application/actions/SessionActions';
import { useSession } from '../utils/Hooks';
import { filterNotificationsById } from './NotificationBadgeHelper';
import { Notification, NotificationType, NotificationTypes } from './NotificationBadgeTypes';

type NotificationBadgeProps = OwnProps;

type OwnProps = {
  className?: string;
  disableHover?: boolean; // Set to true to disable popover content
  large?: boolean; // Set to true to use large style
  notificationFilter?: (notifications: Notification[]) => Notification[];
};

const NotificationBadge: React.FC<NotificationBadgeProps> = props => {
  const dispatch = useDispatch();
  const { notifications: initialNotifications } = useSession();

  const notifications = props.notificationFilter
    ? props.notificationFilter(initialNotifications)
    : initialNotifications;

  if (!notifications.length) {
    return null;
  }

  const notificationIcon = (
    <Tag intent={Intent.DANGER} round={true} large={props.large} data-testid="NotificationBadge">
      {notifications.length}
    </Tag>
  );

  if (!props.disableHover) {
    const makeNotificationTag = (notification: Notification) => {
      const onRemove = () =>
        dispatch(acknowledgeNotifications(filterNotificationsById(notification.id)));

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
      <Popover2
        className={props.className}
        content={notificationTags}
        interactionKind={PopoverInteractionKind.HOVER}
        placement={Position.RIGHT}
        hoverOpenDelay={50}
        hoverCloseDelay={50}
        lazy={true}
      >
        {notificationIcon}
      </Popover2>
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
