import { AssessmentType } from '../assessment/AssessmentTypes';
import { Notification, NotificationFilterFunction } from './NotificationBadgeTypes';

/**
 * @return A function that takes in an array of notification and filters it by assessment id.
 */
export function filterNotificationsByAssessment(assessmentId: number): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => !n.submission_id && n.assessment_id === assessmentId);
}

/**
 * @return A function that takes in an array of notification and filters it by submission id.
 */
export function filterNotificationsBySubmission(submissionId: number): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => n.submission_id === submissionId);
}

/**
 * Notifications will be filtered to one of the Assessment types of the currently selected
 * course, or the Grading type.
 *
 * Notifications with a submission id belongs to the Grading type.
 *
 * @return A function that takes in an array of notification and filters it by the type of notification.
 */
export function filterNotificationsByType(
  assessmentType: AssessmentType
): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => {
      if (assessmentType === 'Grading') {
        return n.submission_id !== undefined;
      }
      return !n.submission_id && assessmentType === n.assessment_type;
    });
}

/**
 * @return A function that takes in an array of notification and filters it by notification id.
 */
export function filterNotificationsById(id: number): NotificationFilterFunction {
  return (notifications: Notification[]) => notifications.filter(n => n.id === id);
}
