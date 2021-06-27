import { Role } from 'src/commons/application/ApplicationTypes';
import { UsernameAndRole } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import { addNewUsersToCourse } from '../AcademyActions';
import { ADD_NEW_USERS_TO_COURSE } from '../AcademyTypes';

test('addNewUsersToCourse generates correct action object', () => {
  const users: UsernameAndRole[] = [
    { username: 'student1', role: Role.Student },
    { username: 'staff1', role: Role.Staff }
  ];
  const provider: string = 'test';

  const action = addNewUsersToCourse(users, provider);
  expect(action).toEqual({
    type: ADD_NEW_USERS_TO_COURSE,
    payload: {
      users,
      provider
    }
  });
});
