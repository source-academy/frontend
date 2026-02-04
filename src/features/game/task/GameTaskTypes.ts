/**
 * Type that encapsulates all the details of a task.
 * @param taskId - the id of the task
 * @param title - the title of the task
 * @param description - the description of the task
 * @param visible - indication of whether this task is currently visible to the user
 */
export type TaskDetail = {
  taskId: string;
  title: string;
  description: string;
  visible: boolean;
};
