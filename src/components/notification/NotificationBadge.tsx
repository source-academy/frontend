import { Intent, Popover, PopoverInteractionKind, Position, Tag } from '@blueprintjs/core';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { acknowledgeNotification } from 'src/actions';
import { AcademyNotification, AcademyNotificationType } from './notificationShape';

type OwnProps = {
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
      content={makeNotificationTags(props.notifications)}
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.RIGHT}
      isOpen={props.enableHover}
    >
      <Tag
        intent={Intent.DANGER}
        round={true}
        large={props.large}
      >
        {props.notifications.length}
      </Tag>
    </Popover>
  );
};

const makeNotificationMessage = (type: AcademyNotificationType) => {
  switch (type) {
    case 'new':
      return 'You have a new assessment.';
    case 'deadline':
      return 'You have an assessment closing soon.';
    case 'autograded':
      return 'Your assessment has been autograded.';
    case 'submitted':
      return 'You have a new submission.';
    case 'unsubmitted':
      return 'You have an assessment that was unsubmitted.';
    case 'graded':
      return 'Your assessment has been manually graded.';
    default:
      return 'Unknown notification';
  }
};

export default connect()(NotificationBadge);
