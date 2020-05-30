import { Notification } from '../notificationBadge/NotificationBadgeTypes';

/**
 * Deprecated, check backend for roles
 */
export enum Roles {
  student = 'student',
  trainer = 'trainer',
  admin = 'admin'
}
export type Role = keyof typeof Roles; // TODO: Duplicate at ApplicationTypes.ts

/**
 * Mock for fetching a role, given an access token. A null
 * value is returned for invalid tokens. Fetching a particular
 * role can be simluated using an optional paramter.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param mockRole a role to mock retrieval for.
 */
export const mockFetchRole = (accessToken: string, role: Role = Roles.trainer): Role | null => {
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

/**
 * Mock for fetching a trainer/admin's student information. A null value
 * is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchStudentInfo = (accessToken: string): StudentInfo[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer];
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
    type: 'new',
    assessment_id: 2,
    assessment_type: 'Mission',
    assessment_title: 'The Secret to Streams'
  },
  {
    id: 2,
    type: 'new',
    assessment_id: 3,
    assessment_type: 'Sidequest',
    assessment_title: 'A sample Sidequest'
  },
  {
    id: 3,
    type: 'autograded',
    assessment_id: 4,
    assessment_type: 'Mission',
    assessment_title: 'A Closed Mission'
  },
  {
    id: 4,
    type: 'graded',
    assessment_id: 4,
    assessment_type: 'Mission',
    assessment_title: 'A Closed Mission'
  },
  {
    id: 5,
    type: 'submitted',
    submission_id: 1,
    assessment_type: 'Mission',
    assessment_title: 'Mission 0'
  },
  {
    id: 6,
    type: 'submitted',
    submission_id: 2,
    assessment_type: 'Mission',
    assessment_title: 'Mission 1'
  },
  {
    id: 7,
    type: 'submitted',
    submission_id: 3,
    assessment_type: 'Mission',
    assessment_title: 'Mission 0'
  }
];
