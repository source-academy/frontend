export type AcademyNotification = {
  assessment_id?: number;
  id: number;
  question_id?: number;
  read: boolean;
  submission_id?: number;
  type: AcademyNotificationType;
};

enum AcademyNotificationTypes {
  new = 'new',
  deadline = 'deadline',
  autograded = 'autograded',
  graded = 'graded',
  submitted = 'submitted',
  unsubmitted = 'unsubmitted'
}

export type AcademyNotificationType = keyof typeof AcademyNotificationTypes;
