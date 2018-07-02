import { GradingOverview } from '../reducers/states'

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
const mockFetchRole = (accessToken: string): Role | null => {
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

export const mockGradingOverviews: GradingOverview[] = [
  {
    submissionId: 0,
    studentId: 0,
    assessmentId: 0,
    assessmentName: "Mission 0 ",
    assessmentCategory: "Mission",
    currentXP: 69,
    graded: false,
    maximumXP: 100,
    studentName: "Al Gorithm"
  },
  {
    submissionId: 1,
    studentId: 0,
    assessmentId: 1,
    assessmentName: "Mission 1",
    assessmentCategory: "Mission",
    currentXP: 0,
    graded: false,
    maximumXP: 400,
    studentName: "Dee Sign"
  },
  {
    submissionId: 2,
    studentId: 1,
    assessmentId: 0,
    assessmentName: "Mission 0",
    assessmentCategory: "Mission",
    currentXP: 1000,
    graded: true,
    maximumXP: 1000,
    studentName: "May Trix"
  }
]

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchGradingOverview = (accessToken: string): GradingOverview[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer]
  const role: Role | null = mockFetchRole(accessToken)
  if (role === null || !permittedRoles.includes(role)) {
    return null
  } else {
    return mockGradingOverviews
  }
}
