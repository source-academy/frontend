import { AssessmentCategory } from '../assessment/assessmentShape';

export type Notification = {
  assessment_id?: number;
  assessment_type?: AssessmentCategory;
  assesssment_title?: string;
  id: number;
  question_id?: number;
  submission_id?: number;
  type: NotificationType;
};

enum NotificationTypes {
  new = 'new',
  deadline = 'deadline',
  autograded = 'autograded',
  graded = 'graded',
  submitted = 'submitted',
  unsubmitted = 'unsubmitted',
  new_message = 'new_message'
}

export type NotificationType = keyof typeof NotificationTypes;
