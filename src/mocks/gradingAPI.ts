import { Grading, GradingOverview } from '../components/academy/grading/gradingShape';
import { mock2DRuneLibrary as mockLibrary } from './assessmentAPI';
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
    submissionId: 0,
    groupName: '1D'
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
    submissionId: 1,
    groupName: '1F'
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
    submissionId: 2,
    groupName: '1F'
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

const mockGrading: Grading = [
  {
    question: {
      answer: "This student's answer to the 0th question......",
      content: `
Hello and welcome to this assessment! This is the *0th question*.

\`\`\`
>>> import this
\`\`\`
`,
      comment: null,
      id: 0,
      library: mockLibrary,
      solutionTemplate: '0th question mock solution template',
      solution: 'This is how the 0th question is `solved`',
      type: 'programming',
      maxGrade: 1000,
      maxXp: 1000,
      grader: {
        name: 'avenger',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 1,
      grade: 1
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 0,
      xp: 0,
      comment: 'Good job!!'
    },
    student: {
      name: 'Al Gorithm',
      id: 0
    }
  },
  {
    question: {
      answer: "This student's answer to the 1st question",
      comment: null,
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
      grade: 1
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 100,
      xp: 100,
      comment: 'Good job!!'
    },
    student: {
      name: 'Al Gorithm',
      id: 0
    }
  },
  {
    question: {
      // C is the answer
      answer: 3,
      comment: null,
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
      grade: 1
    },
    grade: {
      gradeAdjustment: 0,
      xpAdjustment: 0,
      grade: 50,
      xp: 50,
      comment:
        'A Very long string. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a leo et lectus gravida sagittis a non neque. Phasellus consectetur arcu vitae metus vulputate commodo. Phasellus varius sollicitudin quam a porta. Pellentesque mollis molestie felis vitae imperdiet. Nam porta purus ac tellus luctus ultrices. Integer pellentesque nisl vel nunc ullamcorper, in vehicula est dapibus. Nunc dapibus neque dolor, ut mattis massa mattis in. Fusce nec risus nec ex pharetra lacinia. Mauris sit amet ullamcorper sapien. Suspendisse scelerisque neque sed nunc tincidunt, ac semper enim efficitur. Ut sit amet eleifend arcu. Donec viverra at justo vitae eleifend. Morbi ut erat ultricies, hendrerit mi ut, ornare mauris.'
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
