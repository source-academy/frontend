
import * as NotificationHelpers from '../NotificationBadgeHelper';
import { Notification } from '../NotificationBadgeTypes';
import { AssessmentCategories } from '../../assessment/AssessmentTypes';

const notificationMission: Notification = {
  id: 1,
  type: 'new',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1'
};

const notificationSidequest: Notification = {
  id: 2,
  type: 'autograded',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1'
};

const notificationPath: Notification = {
  id: 3,
  type: 'graded',
  assessment_id: 3,
  assessment_type: 'Path',
  assessment_title: 'Path_1'
};

const notificationContest: Notification = {
  id: 4,
  type: 'unsubmitted',
  assessment_id: 4,
  assessment_type: 'Contest',
  assessment_title: 'Contest_1'
};

const notificationSubmissionMission: Notification = {
  id: 5,
  type: 'submitted',
  assessment_id: 1,
  assessment_type: 'Mission',
  assessment_title: 'Mission_1',
  submission_id: 1
};

const notificationSubmissionSidequest: Notification = {
  id: 6,
  type: 'new_message',
  assessment_id: 2,
  assessment_type: 'Sidequest',
  assessment_title: 'Sidequest_1',
  submission_id: 2
};

const notifications: Notification[] = [
  notificationMission,
  notificationSidequest,
  notificationPath,
  notificationContest,
  notificationSubmissionMission,
  notificationSubmissionSidequest
];

test('filterNotificationsByAssessment works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsByAssessment(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notificationMission);
});

test('filterNotificationsBySubmission works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsBySubmission(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notificationSubmissionMission);
});

describe('filterNotificationsByType, ', () => {
  test('Mission works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Mission
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationMission);
  });

  test('Sidequest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Sidequest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationSidequest);
  });

  test('Path works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Path
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationPath);
  });

  test('Contest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType(
      AssessmentCategories.Contest
    )(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationContest);
  });

  test('Grading works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType('Grading')(
      notifications
    );

    expect(newNotifications.length).toEqual(2);
    expect(newNotifications[0]).toEqual(notificationSubmissionMission);
    expect(newNotifications[1]).toEqual(notificationSubmissionSidequest);
  });
});

test('filterNotificationsById works properly', () => {
  const newNotifications = NotificationHelpers.filterNotificationsById(1)(notifications);

  expect(newNotifications.length).toEqual(1);
  expect(newNotifications[0]).toEqual(notificationMission);
});
