import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import { UpdateCourseConfiguration } from '../../application/types/SessionTypes';
import { defaultAcademy } from '../AllTypes';
import { combineSagaHandlers, createActions } from '../utils';

const { actions, reducer } = createSlice({
  name: 'academy',
  initialState: defaultAcademy,
  reducers: {
    saveCanvas(state, { payload }: PayloadAction<HTMLCanvasElement>) {
      return {
        ...state,
        gameCanvas: payload
      };
    }
  }
});

const sagaActions = createActions('academy', {
  addNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => ({ users, provider }),
  addNewStoriesUsersToCourse: (users: NameUsernameRole[], provider: string) => ({
    users,
    provider
  }),
  createCourse: (courseConfig: UpdateCourseConfiguration) => courseConfig
});

export const academyActions = {
  ...sagaActions,
  ...actions
};

export { reducer as AcademyReducer };

combineSagaHandlers(sagaActions, {});
