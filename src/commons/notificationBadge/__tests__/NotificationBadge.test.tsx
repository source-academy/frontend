import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import NotificationBadge from '../NotificationBadge';
import {
  filterNotificationsByAssessment,
  filterNotificationsBySubmission,
  filterNotificationsByType
} from '../NotificationBadgeHelper';
import { Notification } from '../NotificationBadgeTypes';

const notifications: Notification[] = [
  {
    id: 1,
    type: 'new',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 2,
    type: 'published_grading',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams',
    submission_id: 3
  },
  {
    id: 3,
    type: 'unpublished_grading',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 4,
    type: 'unsubmitted',
    assessment_id: 2,
    assessment_type: 'Quests',
    assessment_title: 'The Secret to Streams',
    submission_id: 3
  }
];

const createAppWithMockedNotifications = (
  notifications: Notification[],
  filter?: (notifications: Notification[]) => Notification[]
) => {
  const mockStore = mockInitialStore({ session: { notifications } });
  return (
    <Provider store={mockStore}>
      <NotificationBadge notificationFilter={filter} />
    </Provider>
  );
};

describe('Badge', () => {
  test('does not render with no notifications', () => {
    render(createAppWithMockedNotifications([]));
    expect(screen.queryByTestId('NotificationBadge')).toBe(null);
  });

  test('renders properly with notifications', () => {
    render(createAppWithMockedNotifications(notifications));
    const notificationBadge = screen.getByTestId('NotificationBadge');
    expect(notificationBadge.textContent).toBe(notifications.length.toString());
  });
});

describe('Badge with filter,', () => {
  test('filterNotificationsByAssessment renders properly', () => {
    render(createAppWithMockedNotifications(notifications, filterNotificationsByAssessment(1)));
    const notificationBadge = screen.getByTestId('NotificationBadge');
    expect(notificationBadge.textContent).toBe('2');
  });

  test('filterNotificationsBySubmission renders properly', () => {
    render(createAppWithMockedNotifications(notifications, filterNotificationsBySubmission(3)));
    const notificationBadge = screen.getByTestId('NotificationBadge');
    expect(notificationBadge.textContent).toBe('2');
  });

  test('filterNotificationsByAssessment renders properly', () => {
    render(createAppWithMockedNotifications(notifications, filterNotificationsByType('Missions')));
    const notificationBadge = screen.getByTestId('NotificationBadge');
    expect(notificationBadge.textContent).toBe('2');
  });
});
