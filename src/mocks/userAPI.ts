export enum Roles {
  student = 'student',
  trainer = 'trainer',
  admin = 'admin'
}
export type Role = keyof typeof Roles

export const MOCK_STUDENT_ACCESS_TOKEN = 'STUDENT_ACCESS_TOKEN'
export const MOCK_TRAINER_ACCESS_TOKEN = 'TRAINER_ACCESS_TOKEN'
export const MOCK_ADMIN_ACCESS_TOKEN = 'ADMIN_ACCESS_TOKEN'

/**
 * Mock for fetching a role, given an access token. A null
 * value is returned for invalid tokens.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchRole = (accessToken: string): Role | null => {
  switch (accessToken) {
    case MOCK_STUDENT_ACCESS_TOKEN:
      return Roles.student
    case MOCK_TRAINER_ACCESS_TOKEN:
      return Roles.trainer
    case MOCK_ADMIN_ACCESS_TOKEN:
      return Roles.admin
    default:
      return null
  }
}

/**
 * Represents the information for a student.
 * TODO move this to a separate file once API specs are confirmed.
 */
export type StudentInfo = {
  id: number
  totalXP: number
}

const mockStudentInfo = [
  {
    id: 0,
    totalXP: 69
  },
  {
    id: 1,
    totalXP: 1000
  }
]

/**
 * Mock for fetching a trainer/admin's student information. A null value
 * is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchStudentInfo = (accessToken: string): StudentInfo[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer]
  const role: Role | null = mockFetchRole(accessToken)
  if (role === null || !permittedRoles.includes(role)) {
    return null
  } else {
    return mockStudentInfo
  }
}
