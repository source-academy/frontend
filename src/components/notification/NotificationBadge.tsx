import { Intent, Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { acknowledgeNotification } from '../../actions';
import { AcademyNotification, AcademyNotificationType } from './notificationShape';

type OwnProps = {
  className?: string;
  dispatch: Dispatch<any>;
  enableHover?: boolean; // enable or disable hover popover option
  large?: boolean; // enable to use large style
  notifications: AcademyNotification[];
};

const NotificationBadge: React.SFC<OwnProps> = props => {
  if (!props.notifications.length) {
    return null;
  }

  const makeNotificationTags = (notifications: AcademyNotification[]) => (
    <div className="col">{notifications.map(makeNotificationTag)}</div>
  );

  const makeNotificationTag = (notification: AcademyNotification) => {
    const onRemove = () => props.dispatch(acknowledgeNotification(notification.id));

    return (
      <Tag
        className="row"
        style={{ backgroundColor: 'transparent' }}
        key={`${notification.id}`}
        minimal={true}
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
    default:
      return 'Unknown notification';
  }
};

export default connect()(NotificationBadge);
