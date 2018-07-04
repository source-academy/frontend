import { GradingOverview } from '../components/academy/grading/gradingShape'
import { mockFetchRole, Role, Roles } from './userAPI'

export const mockGradingOverviews: GradingOverview[] = [
  {
    submissionId: 0,
    studentId: 0,
    assessmentId: 0,
    assessmentName: 'Mission 0 ',
    assessmentCategory: 'Mission',
    currentXP: 69,
    graded: false,
    maximumXP: 100,
    studentName: 'Al Gorithm'
  },
  {
    submissionId: 1,
    studentId: 0,
    assessmentId: 1,
    assessmentName: 'Mission 1',
    assessmentCategory: 'Mission',
    currentXP: 0,
    graded: false,
    maximumXP: 400,
    studentName: 'Dee Sign'
  },
  {
    submissionId: 2,
    studentId: 1,
    assessmentId: 0,
    assessmentName: 'Mission 0',
    assessmentCategory: 'Mission',
    currentXP: 1000,
    graded: true,
    maximumXP: 1000,
    studentName: 'May Trix'
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
