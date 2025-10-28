import * as NotificationHelpers from '../NotificationBadgeHelper';
import { Notification } from '../NotificationBadgeTypes';

const notificationMission: Notification = {
  id: 1,
  type: 'new',
  assessment_id: 1,
  assessment_type: 'Missions',
  assessment_title: 'Mission_1'
};

const notificationSidequest: Notification = {
  id: 2,
  type: 'published_grading',
  assessment_id: 2,
  assessment_type: 'Quests',
  assessment_title: 'Quest_1'
};

const notificationPath: Notification = {
  id: 3,
  type: 'published_grading',
  assessment_id: 3,
  assessment_type: 'Paths',
  assessment_title: 'Path_1'
};

const notificationContest: Notification = {
  id: 4,
  type: 'unsubmitted',
  assessment_id: 4,
  assessment_type: 'Contests',
  assessment_title: 'Contest_1'
};

const notificationSubmissionMission: Notification = {
  id: 5,
  type: 'submitted',
  assessment_id: 1,
  assessment_type: 'Missions',
  assessment_title: 'Mission_1',
  submission_id: 1
};

const notificationSubmissionSidequest: Notification = {
  id: 6,
  type: 'new_message',
  assessment_id: 2,
  assessment_type: 'Quests',
  assessment_title: 'Quest_1',
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
    const newNotifications =
      NotificationHelpers.filterNotificationsByType('Missions')(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationMission);
  });

  test('Sidequest works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType('Quests')(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationSidequest);
  });

  test('Path works properly', () => {
    const newNotifications = NotificationHelpers.filterNotificationsByType('Paths')(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationPath);
  });

  test('Contest works properly', () => {
    const newNotifications =
      NotificationHelpers.filterNotificationsByType('Contests')(notifications);

    expect(newNotifications.length).toEqual(1);
    expect(newNotifications[0]).toEqual(notificationContest);
  });

  test('Grading works properly', () => {
    const newNotifications =
      NotificationHelpers.filterNotificationsByType('Grading')(notifications);

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
