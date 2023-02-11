import { mount } from 'enzyme';
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
    type: 'graded',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 3,
    type: 'autograded',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 4,
    type: 'unsubmitted',
    assessment_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'The Secret to Streams'
  }
];

describe('Badge', () => {
  test('renders properly with notifications', () => {
    const mockStore = mockInitialStore({ session: { notifications: notifications } });
    const tree = mount(
      <Provider store={mockStore}>
        <NotificationBadge />
      </Provider>
    );
    expect(tree.debug()).toMatchSnapshot();
  });

  test('does not render with no notifications', () => {
    const mockStore = mockInitialStore({ session: { notifications: [] } });
    const tree = mount(
      <Provider store={mockStore}>
        <NotificationBadge />
      </Provider>
    );

    expect(tree.debug()).toMatchSnapshot();
  });
});

describe('Badge with filter,', () => {
  test('filterNotificationsByAssessment renders properly', () => {
    const mockStore = mockInitialStore({ session: { notifications: notifications } });
    const tree = mount(
      <Provider store={mockStore}>
        <NotificationBadge notificationFilter={filterNotificationsByAssessment(1)} />
      </Provider>
    );
    expect(tree.debug()).toMatchSnapshot();
  });

  test('filterNotificationsBySubmission renders properly', () => {
    const mockStore = mockInitialStore({ session: { notifications: notifications } });
    const tree = mount(
      <Provider store={mockStore}>
        <NotificationBadge notificationFilter={filterNotificationsBySubmission(1)} />
      </Provider>
    );
    expect(tree.debug()).toMatchSnapshot();
  });

  test('filterNotificationsByAssessment renders properly', () => {
    const mockStore = mockInitialStore({ session: { notifications: notifications } });
    const tree = mount(
      <Provider store={mockStore}>
        <NotificationBadge notificationFilter={filterNotificationsByType('Missions')} />
      </Provider>
    );
    expect(tree.debug()).toMatchSnapshot();
  });
});
