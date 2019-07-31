import { ITestcase } from 'src/components/assessment/assessmentShape';
import { Grading, GradingOverview } from '../components/academy/grading/gradingShape';
import { mockRuneLibrary as mockLibrary } from './assessmentAPI';
import { mockFetchRole, Role, Roles } from './userAPI';

export const mockGradingOverviews: GradingOverview[] = [
  {
    gradeAdjustment: 0,
    xpAdjustment: 0,
    assessmentCategory: 'Mission',
    assessmentId: 0,
    assessmentName: 'Mission 0 ',
    currentGrade: 69,
    currentXp: 69,
    xpBonus: 10,
    initialGrade: 69,
    initialXp: 69,
    maxGrade: 100,
    maxXp: 100,
    studentId: 0,
    studentName: 'Al Gorithm',
    submissionId: 1,
    submissionStatus: 'submitted',
    groupName: '1D',
    gradingStatus: 'graded',
    questionCount: 6,
    gradedCount: 6
  },
  {
    gradeAdjustment: -2,
    xpAdjustment: -2,
    assessmentCategory: 'Mission',
    assessmentId: 1,
    assessmentName: 'Mission 1',
    currentGrade: -2,
    currentXp: -2,
    xpBonus: 12,
    initialGrade: 0,
    initialXp: 0,
    maxGrade: 400,
    maxXp: 400,
    studentId: 0,
    studentName: 'Dee Sign',
    submissionId: 2,
    submissionStatus: 'submitted',
    groupName: '1F',
    gradingStatus: 'grading',
    questionCount: 6,
    gradedCount: 2
  },
  {
    gradeAdjustment: 4,
    xpAdjustment: 4,
    assessmentCategory: 'Mission',
    assessmentId: 0,
    assessmentName: 'Mission 0',
    currentGrade: 1000,
    currentXp: 1000,
    xpBonus: 12,
    initialGrade: 996,
    initialXp: 996,
    maxGrade: 1000,
    maxXp: 1000,
    studentId: 1,
    studentName: 'May Trix',
    submissionId: 3,
    submissionStatus: 'submitted',
    groupName: '1F',
    gradingStatus: 'none',
    questionCount: 6,
    gradedCount: 0
  }
];

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param group a boolean if true, only fetches submissions from the grader's group
 */
export const mockFetchGradingOverview = (
  accessToken: string,
  group: boolean
): GradingOverview[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return group ? [mockGradingOverviews[0]] : mockGradingOverviews;
  }
};

const mockTestcases: ITestcase[] = [
  { program: `remainder(12, 7);`, score: 1, answer: `5` },
  { program: `remainder(6, 1);`, score: 2, answer: `0` },
  { program: `remainder(-15, 6);`, score: 2, answer: `-3` },
  { program: `remainder(17, 23) === 17;`, score: 2, answer: `true` }
];

const mockGrading: Grading = [
  {
    question: {
      answer: `function remainder(n, d) {
  return (n - d) < 0 ? n : remainder(n - d, d);
}`,
      content: `
Hello and welcome to this assessment! This is the *0th question*.

\`\`\`
>>> import this
\`\`\`
`,
      prepend: '// THIS IS A PREPEND',
      postpend: '// THIS IS A POSTPEND',
      testcases: mockTestcases,
      roomId: null,
      id: 0,
      library: mockLibrary,
      solutionTemplate: '0th question mock solution template',
      solution: `This is how the 0th question is solved. [7 points]

function remainder(n, d) {
  return n % d;
}`,
      type: 'programming',
      maxGrade: 1000,
      maxXp: 1000,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
      grade: 1,
      autogradingResults: [
        {
          resultType: 'pass'
        },
        {
          resultType: 'fail',
          expected: '8',
          actual: '5'
        },
        {
          resultType: 'error',
          errors: [
            {
              errorType: 'timeout'
            },
            {
              errorType: 'syntax',
              line: 1,
              location: 'student',
              errorLine: 'function fibonacci(n) {',
              errorExplanation: 'Just kidding!'
            }
          ]
        }
      ]
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 0,
      xp: 0,
      roomId: '19422040'
    },
    student: {
      name: 'Al Gorithm',
      id: 0
    }
  },
  {
    question: {
      prepend: '',
      postpend: '',
      testcases: [],
      answer: "This student's answer to the 1st question",
      roomId: null,
      content: 'Hello and welcome to this assessment! This is the 1st question.',
      id: 1,
      library: mockLibrary,
      solutionTemplate: '1st question mock solution template',
      solution: null,
      type: 'programming',
      maxGrade: 200,
      maxXp: 200,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
      grade: 1,
      autogradingResults: [
        {
          resultType: 'pass'
        },
        {
          resultType: 'fail',
          expected: '8',
          actual: '5'
        },
        {
          resultType: 'error',
          errors: [
            {
              errorType: 'timeout'
            },
            {
              errorType: 'syntax',
              line: 1,
              location: 'student',
              errorLine: 'function fibonacci(n) {',
              errorExplanation: 'Just kidding!'
            }
          ]
        }
      ]
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 100,
      xp: 100,
      roomId: '19422040'
    },
    student: {
      name: 'Al Gorithm',
      id: 0
    }
  },
  {
    question: {
      // C is the answer
      prepend: '',
      postpend: '',
      testcases: [],
      answer: 3,
      roomId: null,
      solution: 2,
      content:
        'Hello and welcome to this assessment! This is the 2nd question. Oddly enough, it is an MCQ question!',
      choices: [
        {
          content: 'A',
          hint: 'hint A'
        },
        {
          content: 'B',
          hint: 'hint B'
        },
        {
          content: 'C',
          hint: 'hint C'
        },
        {
          content: 'D',
          hint: 'hint D'
        }
      ],
      id: 2,
      library: mockLibrary,
      type: 'mcq',
      maxGrade: 100,
      maxXp: 100,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
      grade: 1,
      autogradingResults: [
        {
          resultType: 'pass'
        },
        {
          resultType: 'fail',
          expected: '8',
          actual: '5'
        },
        {
          resultType: 'error',
          errors: [
            {
              errorType: 'timeout'
            },
            {
              errorType: 'syntax',
              line: 1,
              location: 'student',
              errorLine: 'function fibonacci(n) {',
              errorExplanation: 'Just kidding!'
            }
          ]
        }
      ]
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 50,
      xp: 50,
      roomId: '19422030'
    },
    student: {
      name: 'Al Gorithm',
      id: 0
    }
  }
];

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchGrading = (accessToken: string, submissionId: number): Grading | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return mockGrading;
  }
};
