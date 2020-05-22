import { AssessmentCategory } from '../assessment/AssessmentTypes';

export const ACKNOWLEDGE_NOTIFICATIONS = 'ACKNOWLEDGE_NOTIFICATIONS';

export type Notification = {
  assessment_id?: number;
  assessment_type?: AssessmentCategory;
  assessment_title?: string;
  id: number;
  submission_id?: number;
  type: NotificationType;
};

export enum NotificationTypes {
  new = 'new',
  deadline = 'deadline',
  autograded = 'autograded',
  graded = 'graded',
  submitted = 'submitted',
  unsubmitted = 'unsubmitted',
  new_message = 'new_message'
}

export type NotificationType = keyof typeof NotificationTypes;

export type NotificationFilterFunction = (notifications: Notification[]) => Notification[];
