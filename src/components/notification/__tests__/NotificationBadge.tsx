import * as React from 'react';

import { mount } from 'enzyme';
import NotificationBadge from '../NotificationBadge';
import { Notification } from '../notificationShape';

const notifications: Notification[] = [
  {
    id: 1,
    type: 'new',
    assessment_id: 1,
    assessment_type: 'Mission',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 2,
    type: 'graded',
    assessment_id: 1,
    assessment_type: 'Mission',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 3,
    type: 'autograded',
    assessment_id: 1,
    assessment_type: 'Mission',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 4,
    type: 'unsubmitted',
    assessment_id: 1,
    assessment_type: 'Mission',
    assessment_title: 'The Secret to Streams'
  }
];

const handleAcknowledgeNotifications = (ids: number[]) => null;

describe('Badge', () => {
  test('renders properly for students', () => {
    const tree = mount(
      <NotificationBadge
        notifications={notifications}
        handleAcknowledgeNotifications={handleAcknowledgeNotifications}
      />
    );
    expect(tree.debug()).toMatchSnapshot();
  });

  test('does not render with no notifications', () => {
    const tree = mount(
      <NotificationBadge
        notifications={[]}
        handleAcknowledgeNotifications={handleAcknowledgeNotifications}
      />
    );

    expect(tree.debug()).toMatchSnapshot();
  });
});
