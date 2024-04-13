import { Chapter, Variant } from 'js-slang/dist/types';

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
  username: 'DevAdmin',
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

export const mockStudents: User[] = [
  {
    userId: 101,
    name: 'Papito Sakolomoto',
    username: 'Papito Sakolomoto',
    courses: [
      {
        courseId: 1,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 102,
    name: 'Carina Heng Xin Ting',
    username: 'Carina Heng Xin Ting',
    courses: [
      {
        courseId: 2,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 103,
    name: 'Valentino Gusion',
    username: 'Valentino Gusion',
    courses: [
      {
        courseId: 3,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 104,
    name: 'Ixia Arlot Rambutan',
    username: 'Ixia Arlot Rambutan',
    courses: [
      {
        courseId: 4,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 105,
    name: 'Ariel Shockatia Ligament',
    username: 'Ariel Shockatia Ligament',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 106,
    name: 'Lolita Sim',
    username: 'Lolita Sim',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 107,
    name: 'Lim Jun Ming',
    username: 'Lim Jun Ming',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 108,
    name: 'Tobias Gray',
    username: 'Tobias Gray',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 109,
    name: 'Lenard Toh See Ming',
    username: 'Lenard Toh See Ming',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 110,
    name: 'Richard Gray',
    username: 'Richard Gray',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 111,
    name: 'Benedict Lim',
    username: 'Benedict Lim',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 112,
    name: 'Harshvathini Tharman',
    username: 'Harshvathini Tharman',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 113,
    name: 'James Cook',
    username: 'James Cook',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 114,
    name: 'Mike Chang',
    username: 'Mike Chang',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 115,
    name: 'Giyu Tomioka',
    username: 'Giyu Tomioka',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 116,
    name: 'Oliver Sandy',
    username: 'Oliver Sandy',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  },
  {
    userId: 117,
    name: 'Muthu Valakrishnan',
    username: 'Muthu Valakrishnan',
    courses: [
      {
        courseId: 5,
        courseName: `CS1101S Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        role: Role.Student,
        viewable: true
      }
    ]
  }
];

export const mockCourseRegistrations: CourseRegistration[] = [
  {
    courseRegId: 1,
    role: Role.Admin,
    group: '1F',
    gameState: {} as GameState,
    courseId: 1,
    xp: 0,
    story: {
      story: 'mission-1',
      playStory: true
    },
    agreedToResearch: true
  },
  {
    courseRegId: 2,
    role: Role.Student,
    group: '1F',
    gameState: {} as GameState,
    courseId: 2,
    xp: 0,
    story: {
      story: 'mission-1',
      playStory: true
    },
    agreedToResearch: true
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
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: '',
    assetsPrefix: ''
  },
  {
    courseName: `CS2040S Data Structures and Algorithms (AY20/21 Sem 2)`,
    courseShortName: `CS2040S`,
    viewable: true,
    enableGame: false,
    enableAchievements: false,
    enableSourcecast: false,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_2,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help Text!',
    assetsPrefix: ''
  }
];

/**
 * Mock for fetching a students.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchStudents = (accessToken: string): User[] | null => {
  // const permittedRoles: Role[] = [Role.Admin, Role.Staff, Role.Student];
  // const role: Role | null = mockFetchRole(accessToken);
  // if (role === null || !permittedRoles.includes(role)) {
  //   return null;
  // } else {
  //   return mockStudents;
  // }
  return mockStudents;
};

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
    type: NotificationTypes.new,
    assessment_id: 6,
    assessment_type: 'Paths',
    assessment_title: 'Basic Logic'
  },
  {
    id: 2,
    type: NotificationTypes.new,
    assessment_id: 7,
    assessment_type: 'Missions',
    assessment_title: 'Symphony of the Winds'
  },
  {
    id: 3,
    type: NotificationTypes.submitted,
    submission_id: 1,
    assessment_type: 'Missions',
    assessment_title: 'Mission 0'
  },
  {
    id: 4,
    type: NotificationTypes.submitted,
    submission_id: 2,
    assessment_type: 'Missions',
    assessment_title: 'Mission 1'
  },
  {
    id: 5,
    type: NotificationTypes.submitted,
    submission_id: 3,
    assessment_type: 'Missions',
    assessment_title: 'Mission 0'
  }
];
