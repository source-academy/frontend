export interface AcademyNotification {
    assessment_id?: number;
    id: number;
    question_id?: number;
    read: boolean;
    submission_id?: number;
    type: NotificationType;
}

export enum AcademyNotificationTypes {
    new = 'new',
    deadline = 'deadline',
    autograded = 'autograded',
    manually_graded = 'manually_graded',
    submitted = 'submitted'
  }

export type AcademyNotificationType = keyof typeof AcademyNotificationTypes;
