import { AssessmentCategories } from '../../../components/assessment/assessmentShape';
import * as NotificationHelpers from '../NotificationHelpers';
import { Notification } from '../notificationShape';

const notification1: Notification = {
  id: 1,
  type: 'new',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1'
};

const notification2: Notification = {
  id: 2,
  type: 'autograded',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1'
};

const notification3: Notification = {
  id: 3,
  type: 'graded',
  assessment_id: 3,
  assessment_type: 'Path',
  assessment_title: 'Path_1'
};

const notification4: Notification = {
  id: 4,
  type: 'unsubmitted',
  assessment_id: 4,
  assessment_type: 'Contest',
  assessment_title: 'Contest_1'
};

const notification5: Notification = {
  id: 5,
  type: 'submitted',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1',
  submission_id: 1
};

const notification6: Notification = {
  id: 6,
  type: 'new_message',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1',
  submission_id: 2
};

const notifications: Notification[] = [
  notification1,
  notification2,
  notification3,
  notification4,
  notification5,
  notification6
];

test('filterNotificationsByAssessment works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsByAssessment(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notification1);
});

test('filterNotificationsBySubmission works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsBySubmission(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notification5);
});

describe('filterNotificationsByType, ', () => {
  test('Mission works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Mission
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification1);
  });

  test('Sidequest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Sidequest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification2);
  });

  test('Path works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Path
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification3);
  });

  test('Contest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Contest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification4);
  });

  test('Grading works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType('Grading')(
      notifications
    );

    expect(newNotifications.length).toEqual(2);
    expect(newNotifications[0]).toEqual(notification5);
    expect(newNotifications[1]).toEqual(notification6);
  });
});
