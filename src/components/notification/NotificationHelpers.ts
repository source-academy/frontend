import { AssessmentCategories } from '../assessment/assessmentShape';
import { Notification } from './notificationShape';

type filterByTypeOptions = AssessmentCategories | 'Grading';

export function filterNotificationsByAssessment(
  notifications: Notification[],
  assessmentId: number
) {
  return notifications.filter(n => n.assessment_id === assessmentId);
}

export function filterNotificationsBySubmission(
  notifications: Notification[],
  submissionId: number
) {
  return notifications.filter(n => n.submission_id === submissionId);
}

/*
  Notifications will be filtered to either one of the Assessment Category, or the Grading Category.

  Notifications with a submission id belong to Grading.
*/
export function filterNotificationsByType(
  notifications: Notification[],
  assessmentType: filterByTypeOptions
) {
  return notifications.filter(n => {
    if (assessmentType === 'Grading') {
      return n.submission_id !== undefined;
    }
    return n.submission_id === undefined && assessmentType === n.assessment_type;
  });
}
