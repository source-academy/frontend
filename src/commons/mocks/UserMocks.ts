import { GameState, Role } from '../application/ApplicationTypes';
import {
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  User
} from '../application/types/SessionTypes';
import { Notification, NotificationTypes } from '../notificationBadge/NotificationBadgeTypes';

/**
 * Mock for fetching a role, given an access token. A null
 * value is returned for invalid tokens. Fetching a particular
 * role can be simluated using an optional paramter.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param mockRole a role to mock retrieval for.
 */
export const mockFetchRole = (accessToken: string, role: Role = Role.Staff): Role | null => {
  return role;
};

/**
 * Represents the information for a student.
 * TODO move this to a separate file once API specs are confirmed.
 */
export type StudentInfo = {
  id: number;
  totalXP: number;
};

const mockStudentInfo = [
  {
    id: 0,
    totalXP: 69
  },
  {
    id: 1,
    totalXP: 1000
  }
];

export const mockUser: User = {
  userId: 123,
  name: 'DevAdmin',
  courses: [
    {
      courseId: 1,
      courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
      courseShortName: `CS1101S`,
      role: Role.Admin,
      viewable: true
    },
    {
      courseId: 2,
      courseName: `CS2040S Data Structures and Algorithms (AY20/21 Sem 2)`,
      courseShortName: `CS2040S`,
      role: Role.Admin,
      viewable: false
    },
    {
      courseId: 3,
      courseName: `CS2030S Programming Methodology II (AY21/22 Sem 1)`,
      courseShortName: `CS2030S`,
      role: Role.Staff,
      viewable: false
    }
  ]
};

export const mockCourseRegistrations: CourseRegistration[] = [
  {
    courseRegId: 1,
    role: Role.Admin,
    group: '1F',
    gameState: {} as GameState,
    courseId: 1,
    grade: 0,
    maxGrade: 10,
    xp: 0,
    story: {
      story: 'mission-1',
      playStory: true
    }
  },
  {
    courseRegId: 2,
    role: Role.Student,
    group: '1F',
    gameState: {} as GameState,
    courseId: 2,
    grade: 0,
    maxGrade: 10,
    xp: 0,
    story: {
      story: 'mission-1',
      playStory: true
    }
  }
];

export const mockAdminPanelCourseRegistrations: AdminPanelCourseRegistration[] = [
  {
    courseRegId: 1,
    courseId: 1,
    name: 'DevAdmin',
    username: 'test/admin',
    role: Role.Admin
  },
  {
    courseRegId: 3,
    courseId: 1,
    name: 'Dummy student',
    username: 'test/student',
    role: Role.Student
  },
  {
    courseRegId: 4,
    courseId: 1,
    name: 'Dummy staff',
    username: 'test/staff',
    role: Role.Staff
  }
];

export const mockCourseConfigurations: CourseConfiguration[] = [
  {
    courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
    courseShortName: `CS1101S`,
    viewable: true,
    enableGame: false,
    enableAchievements: true,
    enableSourcecast: true,
    sourceChapter: 1,
    sourceVariant: 'default',
    moduleHelpText: ''
  },
  {
    courseName: `CS2040S Data Structures and Algorithms (AY20/21 Sem 2)`,
    courseShortName: `CS2040S`,
    viewable: true,
    enableGame: false,
    enableAchievements: false,
    enableSourcecast: false,
    sourceChapter: 2,
    sourceVariant: 'default',
    moduleHelpText: 'Help Text!'
  }
];

/**
 * Mock for fetching a trainer/admin's student information. A null value
 * is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchStudentInfo = (accessToken: string): StudentInfo[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return mockStudentInfo;
  }
};

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: NotificationTypes.deadline,
    assessment_id: 3,
    assessment_type: 'Quests',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 2,
    type: NotificationTypes.autograded,
    assessment_id: 4,
    assessment_type: 'Missions',
    assessment_title: 'A Closed Mission'
  },
  {
    id: 3,
    type: NotificationTypes.graded,
    assessment_id: 4,
    assessment_type: 'Missions',
    assessment_title: 'A Closed Mission'
  },
  {
    id: 4,
    type: NotificationTypes.new,
    assessment_id: 6,
    assessment_type: 'Paths',
    assessment_title: 'Basic Logic'
  },
  {
    id: 5,
    type: NotificationTypes.new,
    assessment_id: 7,
    assessment_type: 'Missions',
    assessment_title: 'Symphony of the Winds'
  },
  {
    id: 6,
    type: NotificationTypes.submitted,
    submission_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'Mission 0'
  },
  {
    id: 7,
    type: NotificationTypes.submitted,
    submission_id: 2,
    assessment_type: 'Missions',
    assessment_title: 'Mission 1'
  },
  {
    id: 8,
    type: NotificationTypes.submitted,
    submission_id: 3,
    assessment_type: 'Missions',
    assessment_title: 'Mission 0'
  }
];
