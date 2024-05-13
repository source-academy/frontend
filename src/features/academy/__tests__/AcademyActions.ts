import { Chapter, Variant } from 'js-slang/dist/types';
import { Role } from 'src/commons/application/ApplicationTypes';
import { UpdateCourseConfiguration } from 'src/commons/application/types/SessionTypes';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import AcademyActions from '../AcademyActions';

test('addNewUsersToCourse generates correct action object', () => {
  const users: UsernameRoleGroup[] = [
    { username: 'student1', role: Role.Student },
    { username: 'staff1', role: Role.Staff }
  ];
  const provider: string = 'test';

  const action = AcademyActions.addNewUsersToCourse(users, provider);
  expect(action).toEqual({
    type: AcademyActions.addNewUsersToCourse.type,
    payload: {
      users,
      provider
    }
  });
});

test('createCourse generates correct action object', () => {
  const courseConfig: UpdateCourseConfiguration = {
    courseName: 'CS1101S Programming Methodology (AY20/21 Sem 1)',
    courseShortName: 'CS1101S',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help Text'
  };

  const action = AcademyActions.createCourse(courseConfig);
  expect(action).toEqual({
    type: AcademyActions.createCourse.type,
    payload: courseConfig
  });
});
