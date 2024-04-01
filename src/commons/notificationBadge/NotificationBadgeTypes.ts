export type Notification = {
  assessment_id?: number;
  assessment_type?: string;
  assessment_title?: string;
  id: number;
  submission_id?: number;
  type: NotificationType;
};

export enum NotificationTypes {
  new = 'new',
  submitted = 'submitted',
  unsubmitted = 'unsubmitted',
<<<<<<< Updated upstream
  new_message = 'new_message',
  published_grading = 'published_grading',
  unpublished_grading = 'unpublished_grading'
=======
  published_grading = 'published_grading',
  unpublished_grading = 'unpublished_grading',
  new_message = 'new_message'
>>>>>>> Stashed changes
}

export type NotificationType = keyof typeof NotificationTypes;

export type NotificationFilterFunction = (notifications: Notification[]) => Notification[];
