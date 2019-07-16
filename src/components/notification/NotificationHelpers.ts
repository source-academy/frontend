import { AssessmentCategories } from '../assessment/assessmentShape';
import { Notification } from './notificationShape';

type filterByIdOptions = {
  assessment_id?: number;
  submission_id?: number;
};

type filterByTypeOptions = AssessmentCategories | 'Grading';

export function filterNotificationsById(
  notifications: Notification[],
  opts: filterByIdOptions = {}
) {
  return notifications.filter(
    n =>
      (opts.assessment_id === undefined || n.assessment_id === opts.assessment_id) &&
      (opts.submission_id === undefined || n.submission_id === opts.submission_id)
  );
}

/*
  For filtering notifications on the academy navigation bar.

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
