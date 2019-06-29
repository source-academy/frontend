export interface AcademyNotification {
    assessment_id?: number;
    id: number;
    question_id?: number;
    read: boolean;
    submission_id?: number;
    type: AcademyNotificationType;
}

enum AcademyNotificationTypes {
    new = 'new',
    deadline = 'deadline',
    autograded = 'autograded',
    graded = 'graded',
    submitted = 'submitted'
  }

type AcademyNotificationType = keyof typeof AcademyNotificationTypes;
