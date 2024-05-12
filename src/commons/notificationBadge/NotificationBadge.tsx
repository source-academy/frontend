import { Intent, Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import React from 'react';
import { useDispatch } from 'react-redux';

import SessionActions from '../application/actions/SessionActions';
import { useSession } from '../utils/Hooks';
import { filterNotificationsById } from './NotificationBadgeHelper';
import { Notification, NotificationType, NotificationTypes } from './NotificationBadgeTypes';

type Props = {
  className?: string;
  disableHover?: boolean; // Set to true to disable popover content
  large?: boolean; // Set to true to use large style
  notificationFilter?: (notifications: Notification[]) => Notification[];
};

const NotificationBadge: React.FC<Props> = props => {
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
        dispatch(SessionActions.acknowledgeNotifications(filterNotificationsById(notification.id)));

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
        placement={Position.RIGHT}
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
    case NotificationTypes.submitted:
      return 'This submission is new.';
    case NotificationTypes.unsubmitted:
      return 'This assessment has been unsubmitted.';
    case NotificationTypes.published_grading:
      return "This submission's grading has been published.";
    case NotificationTypes.unpublished_grading:
      return "This submission's grading has been unpublished.";
    case NotificationTypes.new_message:
      return 'There are new messages.';
    default:
      return 'Unknown notification';
  }
};

export default NotificationBadge;
