import { UpdateCourseConfiguration } from 'src/commons/application/types/SessionTypes';
import { createActions } from 'src/commons/redux/utils';
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

const AcademyActions = createActions('academy', {
  createCourse: (courseConfig: UpdateCourseConfiguration) => courseConfig,
  addNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => ({ users, provider }),
  addNewStoriesUsersToCourse: (users: NameUsernameRole[], provider: string) => ({ users, provider })
});

// For compatibility with existing code (actions helper)
export default AcademyActions;
