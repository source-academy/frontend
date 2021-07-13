import { GradingSummary } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview } from '../../features/grading/GradingTypes';
import { Role } from '../application/ApplicationTypes';
import { Testcase, TestcaseTypes } from '../assessment/AssessmentTypes';
import { mockRuneLibrary } from './AssessmentMocks';
import { mockFetchRole } from './UserMocks';

export const mockGradingOverviews: GradingOverview[] = [
  {
    xpAdjustment: 0,
    assessmentType: 'Missions',
    assessmentId: 0,
    assessmentName: 'Mission 0 ',
    currentXp: 69,
    xpBonus: 10,
    initialXp: 69,
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
    xpAdjustment: -2,
    assessmentType: 'Missions',
    assessmentId: 1,
    assessmentName: 'Mission 1',
    currentXp: -2,
    xpBonus: 12,
    initialXp: 0,
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
    xpAdjustment: 4,
    assessmentType: 'Missions',
    assessmentId: 0,
    assessmentName: 'Mission 0',
    currentXp: 1000,
    xpBonus: 12,
    initialXp: 996,
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
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return group
      ? [mockGradingOverviews[0]]
      : mockGradingOverviews.sort((subX: GradingOverview, subY: GradingOverview) =>
          subX.assessmentId !== subY.assessmentId
            ? subY.assessmentId - subX.assessmentId
            : subY.submissionId - subX.submissionId
        );
  }
};

export const mockTestcases: Testcase[] = [
  { type: TestcaseTypes.public, program: `remainder(12, 7);`, score: 1, answer: `5` },
  { type: TestcaseTypes.public, program: `remainder(6, 1);`, score: 2, answer: `0` },
  { type: TestcaseTypes.opaque, program: `remainder(-15, 6);`, score: 2, answer: `-3` },
  { type: TestcaseTypes.opaque, program: `remainder(17, 23) === 17;`, score: 2, answer: `true` }
];

export const mockGrading: Grading = [
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
      id: 0,
      library: mockRuneLibrary,
      solutionTemplate: '0th question mock solution template',
      solution: `This is how the 0th question is solved. [7 points]

function remainder(n, d) {
  return n % d;
}`,
      type: 'programming',
      maxXp: 1000,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
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
              errorType: 'dummyErrorType'
            }
          ]
        },
        {
          resultType: 'error',
          errors: [
            {
              errorType: 'systemError',
              errorMessage: "Cannot read property 'getUniformLocation' of null"
            }
          ]
        },
        {
          resultType: 'error',
          errors: [
            {
              errorType: 'timeout'
            },
            {
              errorType: 'syntax',
              line: 2,
              location: 'student',
              errorLine: 'return (n - d) < 0 ? n : remainder(n - d, d)',
              errorExplanation: 'Missing semicolon at the end of statement'
            }
          ]
        }
      ],
      blocking: false
    },
    grade: {
      xpAdjustment: 0,
      xp: 0,
      comments: `Good job. You are awarded the full marks!

----
## markdown test

# header

**bold**

_italics_

* list

1. numbered list

- [] checkboxes

> quote

    code

[link to Source Academy](https://sourceacademy.nus.edu.sg)

![](image-url-goes-here)
      `,
      grader: {
        name: 'HARTIN MENZ',
        id: 100
      },
      gradedAt: '2019-08-16T13:26:32+00:00'
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
      content: 'Hello and welcome to this assessment! This is the 1st question.',
      id: 1,
      library: mockRuneLibrary,
      solutionTemplate: '1st question mock solution template',
      solution: null,
      type: 'programming',
      maxXp: 200,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
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
      ],
      blocking: false
    },
    grade: {
      xpAdjustment: 0,
      xp: 100,
      comments: `You open the Report Card, not knowing what to expect...

## WOW!
Amazing grasp of runes. We can now move on to the next assignment.

<br/>

Robot Dog: \`woof\`

You look at the display of the robot dog.

    FEED ME
1. Bread
2. Water

<br/>

* I am hungry.
* I am thirsty.

<br/>
<br/>

New message from **Avenger**!

> _Cadet, please meet me at Level X-05, outside the pod bay doors. There is an important mission awaiting us._

> _May the [Source](https://sourceacademy.nus.edu.sg) be with you._

> Best regards, Avocado A. Avenger

#### Upcoming Tasks
- [] Meet Avenger Avenger at Level X-05
- [] Open the Pod Bay Doors
      `
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
      library: mockRuneLibrary,
      type: 'mcq',
      maxXp: 100,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
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
      ],
      blocking: false
    },
    grade: {
      xpAdjustment: 0,
      xp: 50
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
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return mockGrading;
  }
};

export const mockGradingSummary: GradingSummary = {
  cols: [
    'group',
    'avenger',
    'ungradedMissions',
    'submittedMissions',
    'ungradedQuests',
    'submittedQuests'
  ],
  rows: [
    {
      group: 'Mock Group 1',
      avenger: 'John',
      ungradedMissions: 123,
      submittedMissions: 200,
      ungradedQuests: 100,
      submittedQuests: 117
    },
    {
      group: 'Mock Group 2',
      avenger: 'Molly',
      ungradedMissions: 1232,
      submittedMissions: 205430,
      ungradedQuests: 345,
      submittedQuests: 11547
    },
    {
      group: 'Mock Group 3',
      avenger: 'Lenny',
      ungradedMissions: 1532,
      submittedMissions: 22200,
      ungradedQuests: 134500,
      submittedQuests: 6777
    }
  ]
};
