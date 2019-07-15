import { Notification } from './notificationShape';

type filterOptions = {
  assessment_id?: number;
  submission_id?: number;
};

export function filterNotificationsBy(notifications: Notification[], opts: filterOptions = {}) {
  return notifications.filter(
    n =>
      (opts.assessment_id !== undefined ? n.assessment_id === opts.assessment_id : true) &&
      (opts.submission_id !== undefined ? n.submission_id === opts.submission_id : true)
  );
}
