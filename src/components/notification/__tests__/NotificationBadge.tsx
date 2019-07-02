import * as React from 'react';

import { mount } from 'enzyme';
import NotificationBadge from '../NotificationBadge';
import { AcademyNotification } from '../notificationShape';

const notifications: AcademyNotification[] = [
  {
    id: 1,
    type: 'new',
    assessment_id: 1,
    assessment_type: 'Mission',
    assesssment_title: 'The Secret to Streams'
  },
  {
    id: 2,
    type: 'graded',
    assessment_id: 1,
    assessment_type: 'Mission',
    assesssment_title: 'The Secret to Streams'
  }
];

describe('Badge', () => {
  test('renders properly with notifications', () => {
    const tree = mount(
      <NotificationBadge notifications={notifications} handleAcknowledgeNotification={id => null} />
    );

    expect(tree.debug()).toMatchSnapshot();
  });

  test('does not render with no notifications', () => {
    const tree = mount(
        <NotificationBadge notifications={[]} handleAcknowledgeNotification={id => null} />
      );
  
      expect(tree.debug()).toMatchSnapshot();
  });
});
