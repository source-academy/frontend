import { AssessmentCategories } from '../../../components/assessment/assessmentShape';
import * as NotificationHelpers from '../NotificationHelpers';
import { Notification } from '../notificationShape';

const notification_1: Notification = {
  id: 1,
  type: 'new',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1'
};

const notification_2: Notification = {
  id: 2,
  type: 'autograded',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1'
};

const notification_3: Notification = {
  id: 3,
  type: 'graded',
  assessment_id: 3,
  assessment_type: 'Path',
  assessment_title: 'Path_1'
};

const notification_4: Notification = {
  id: 4,
  type: 'unsubmitted',
  assessment_id: 4,
  assessment_type: 'Contest',
  assessment_title: 'Contest_1'
};

const notification_5: Notification = {
  id: 5,
  type: 'submitted',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1',
  submission_id: 1
};

const notification_6: Notification = {
  id: 6,
  type: 'new_message',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1',
  submission_id: 2
};

const notifications: Notification[] = [
  notification_1,
  notification_2,
  notification_3,
  notification_4,
  notification_5,
  notification_6
];

test('filterNotificationsByAssessment works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsByAssessment(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notification_1);
});

test('filterNotificationsBySubmission works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsBySubmission(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notification_5);
});

describe('filterNotificationsByType, ', () => {
  test('Mission works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Mission
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification_1);
  });

  test('Sidequest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Sidequest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification_2);
  });

  test('Path works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Path
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification_3);
  });

  test('Contest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Contest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notification_4);
  });

  test('Grading works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType('Grading')(
      notifications
    );

    expect(newNotifications.length).toEqual(2);
    expect(newNotifications[0]).toEqual(notification_5);
    expect(newNotifications[1]).toEqual(notification_6);
  });
});
