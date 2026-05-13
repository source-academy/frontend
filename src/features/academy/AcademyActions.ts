import type { UpdateCourseConfiguration } from 'src/commons/application/types/SessionTypes';
import { createActions } from 'src/commons/redux/utils';
import type { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

const AcademyActions = createActions('academy', {
  createCourse: (courseConfig: UpdateCourseConfiguration) => courseConfig,
  addNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => ({ users, provider })
});

// For compatibility with existing code (actions helper)
export default AcademyActions;
