import { Intent, Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import * as React from 'react';
import { AcademyNotification, AcademyNotificationType } from './notificationShape';

type OwnProps = {
  className?: string;
  enableHover?: boolean; // enable or disable hover popover option
  large?: boolean; // enable to use large style
  notifications: AcademyNotification[];
};

export type DispatchProps = {
  handleAcknowledgeNotification: (notificationIds: number[]) => void;
};

const NotificationBadge: React.SFC<OwnProps & DispatchProps> = props => {
  if (!props.notifications.length) {
    return null;
  }

  const makeNotificationTags = (notifications: AcademyNotification[]) => (
    <div className="col">{notifications.map(makeNotificationTag)}</div>
  );

  const makeNotificationTag = (notification: AcademyNotification) => {
    const onRemove = () => props.handleAcknowledgeNotification([notification.id]);

    return (
      <Tag
        className="row"
        style={{ backgroundColor: 'transparent', marginLeft: '0.4rem', marginRight: '0.4rem' }}
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
      isOpen={props.enableHover}
    >
      <Tag intent={Intent.DANGER} round={true} large={props.large}>
        {props.notifications.length}
      </Tag>
    </Popover>
  );
};

const makeNotificationMessage = (type: AcademyNotificationType) => {
  switch (type) {
    case 'new':
      return 'This assessment is new.';
    case 'deadline':
      return 'This assessment is closing soon.';
    case 'autograded':
      return 'This assessment has been autograded.';
    case 'submitted':
      return 'This submission is new.';
    case 'unsubmitted':
      return 'This assessment has been unsubmitted.';
    case 'graded':
      return 'This assessment has been manually graded.';
    case 'new_message':
      return 'There are new messages.';
    default:
      return 'Unknown notification';
  }
};

export default NotificationBadge;
