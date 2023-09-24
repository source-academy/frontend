import { createSlice,PayloadAction } from '@reduxjs/toolkit';
import { AcademyState } from 'src/features/academy/AcademyTypes';
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import { UpdateCourseConfiguration } from '../../application/types/SessionTypes';
import { combineSagaHandlers, createActions } from '../utils';

export const defaultAcademy: AcademyState = {
  gameCanvas: undefined
};

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
})

const sagaActions = createActions('academy', {
  addNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => ({ users, provider }),
  addNewStoriesUsersToCourse: (users: NameUsernameRole[], provider: string) => ({ users, provider }),
  createCourse: (courseConfig: UpdateCourseConfiguration) => courseConfig,
})

export const academyActions = {
  ...sagaActions,
  ...actions
}

export { reducer as AcademyReducer }

combineSagaHandlers(sagaActions, {

})
