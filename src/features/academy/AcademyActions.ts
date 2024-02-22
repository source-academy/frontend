import { createAction } from '@reduxjs/toolkit';
import { UpdateCourseConfiguration } from 'src/commons/application/types/SessionTypes';
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import {
  ADD_NEW_STORIES_USERS_TO_COURSE,
  ADD_NEW_USERS_TO_COURSE,
  CREATE_COURSE
} from './AcademyTypes';

export const createCourse = createAction(
  CREATE_COURSE,
  (courseConfig: UpdateCourseConfiguration) => ({ payload: courseConfig })
);

export const addNewUsersToCourse = createAction(
  ADD_NEW_USERS_TO_COURSE,
  (users: UsernameRoleGroup[], provider: string) => ({ payload: { users, provider } })
);

export const addNewStoriesUsersToCourse = createAction(
  ADD_NEW_STORIES_USERS_TO_COURSE,
  (users: NameUsernameRole[], provider: string) => ({ payload: { users, provider } })
);
