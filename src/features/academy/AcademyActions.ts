import { UsernameAndRole } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';
import { action } from 'typesafe-actions';

import { ADD_NEW_USERS_TO_COURSE, SAVE_CANVAS } from './AcademyTypes';

export const saveCanvas = (canvas: HTMLCanvasElement) => action(SAVE_CANVAS, canvas);

export const addNewUsersToCourse = (users: UsernameAndRole[], provider: string) =>
  action(ADD_NEW_USERS_TO_COURSE, { users, provider });
