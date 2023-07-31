import { UpdateCourseConfiguration } from 'src/commons/application/types/SessionTypes';
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';
import { action } from 'typesafe-actions';

import {
  ADD_NEW_STORIES_USERS_TO_COURSE,
  ADD_NEW_USERS_TO_COURSE,
  CREATE_COURSE,
  SAVE_CANVAS
} from './AcademyTypes';

export const saveCanvas = (canvas: HTMLCanvasElement) => action(SAVE_CANVAS, canvas);

export const createCourse = (courseConfig: UpdateCourseConfiguration) =>
  action(CREATE_COURSE, courseConfig);

export const addNewUsersToCourse = (users: UsernameRoleGroup[], provider: string) =>
  action(ADD_NEW_USERS_TO_COURSE, { users, provider });

export const addNewStoriesUsersToCourse = (users: NameUsernameRole[], provider: string) =>
  action(ADD_NEW_STORIES_USERS_TO_COURSE, { users, provider });
