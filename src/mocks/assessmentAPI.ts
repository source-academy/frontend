import {
  AssessmentCategories,
  AssessmentStatuses,
  ExternalLibraryNames,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  Library
} from '../components/assessment/assessmentShape';
import { externalLibraries } from '../reducers/externalLibraries';

const mockUnopenedAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 1,
    id: 1,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2038-06-18T05:24:26.026Z',
    title: 'An Odessey to Runes (Duplicate)',
    shortSummary:
      'This is a test for the UI of the unopened assessment overview. It links to the mock Mission 0',
    status: AssessmentStatuses.not_attempted,
    story: 'mission-1',
    xp: 0,
    gradingStatus: 'none'
  }
];

const mockOpenedAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 2,
    id: 1,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2018-06-18T05:24:26.026Z',
    title: 'An Odessey to Runes',
    shortSummary: `
*Lorem ipsum* dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua.

\`\`\`
const a = 5;
\`\`\`

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
_doloremque laudantium_, totam rem aperiam, eaque ipsa quae ab illo inventore
[veritatis et quasi architecto](google.com) beatae vitae dicta sunt
\`explicabo\`.

`,
    status: AssessmentStatuses.attempted,
    story: 'mission-1',
    xp: 1,
    gradingStatus: 'none'
  },
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=World&font=lobster',
    grade: 3,
    id: 2,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'The Secret to Streams',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    status: AssessmentStatuses.attempting,
    story: 'mission-2',
    xp: 2,
    gradingStatus: 'none'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=Hello',
    grade: 4,
    id: 3,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'A sample Sidequest',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    status: AssessmentStatuses.not_attempted,
    story: 'sidequest-2.1',
    xp: 3,
    gradingStatus: 'none'
  }
];

const mockClosedAssessmentOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    grade: 5,
    id: 4,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'A closed Mission',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is not graded. It should render as a red cross.',
    status: AssessmentStatuses.submitted,
    story: 'mission-3',
    xp: 4,
    gradingStatus: 'none'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    grade: 1500,
    id: 5,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (partially graded) Sidequest',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is partially graded (undergoing manual grading). It should render as an orange clock.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 500,
    gradingStatus: 'grading'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    grade: 250,
    id: 5,
    maxGrade: 700,
    maxXp: 500,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (fully graded) Sidequest',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is fully graded. It should render as a green tick. This sidequest links to the mock Sidequest 4.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 500,
    gradingStatus: 'graded'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    grade: 0,
    id: 5,
    maxGrade: 0,
    maxXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Ungraded assessment',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment does not require manual grading (e.g. paths and contests). It should render as a blue disable sign. This sidequest links to the mock Sidequest 4.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 0,
    gradingStatus: 'excluded'
  }
];

export const mockAssessmentOverviews = [
  ...mockUnopenedAssessmentsOverviews,
  ...mockOpenedAssessmentsOverviews,
  ...mockClosedAssessmentOverviews
];

const mockGlobals: Array<[string, any]> = [
  ['testNumber', 3.141592653589793],
  ['testString', 'who dat boi'],
  ['testBooleanTrue', true],
  ['testBooleanFalse', false],
  ['testBooleanUndefined', undefined],
  ['testBooleanNull', null],
  ['testObject', { a: 1, b: 2 }],
  ['testArray', [1, 2, 'a', 'b']]
];

const mockSoundLibrary: Library = {
  chapter: 1,
  external: {
    name: ExternalLibraryNames.SOUNDS,
    symbols: externalLibraries.get(ExternalLibraryNames.SOUNDS)!
  },
  globals: mockGlobals
};

export const mockRuneLibrary: Library = {
  chapter: 1,
  external: {
    name: ExternalLibraryNames.RUNES,
    symbols: externalLibraries.get(ExternalLibraryNames.RUNES)!
  },
  globals: mockGlobals
};

const mockCurveLibrary: Library = {
  chapter: 1,
  external: {
    name: ExternalLibraryNames.CURVES,
    symbols: externalLibraries.get(ExternalLibraryNames.CURVES)!
  },
  globals: mockGlobals
};

const mockToneMatrixLibrary: Library = {
  chapter: 1,
  external: {
    name: ExternalLibraryNames.SOUNDS,
    symbols: ['get_matrix']
  },
  globals: mockGlobals
};

export const mockAssessmentQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    autogradingResults: [],
    answer: null,
    content: `
This question has an id of \`0\`.

\`\`\`
What's your favourite dinner food?
\`\`\`
`,
    comment: null,
    id: 0,
    library: mockSoundLibrary,
    prepend: `const pizza = "pizza";
const sushi = "sushi";
const chickenrice = "chicken rice";`,
    postpend: "// This is a mock Postpend! You shouldn't be able to see me!",
    testcases: [
      {
        program: `answer();`,
        score: 1,
        answer: `"pizza"`
      },
      {
        program: `answer();`,
        score: 1,
        answer: `"sushi"`
      },
      {
        program: `answer();`,
        score: 1,
        answer: `"chicken rice"`
      }
    ],
    solutionTemplate: `function answer() {
  // Write something here!
}
`,
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    autogradingResults: [],
    answer: `function areaOfCircle(x) {
  return square(x) * pi;
}

function volumeOfSphere(x) {
  return 4 / 3 * cube(x) * pi;
}`,
    comment: '`Great Job` **young padawan**',
    content: 'Hello and welcome to this assessment! This is the 1st question.',
    id: 1,
    library: mockRuneLibrary,
    prepend: `const square = x => x * x;
const cube = x => x * x * x;
const pi = 3.1415928;`,
    postpend: '',
    testcases: [
      {
        program: `areaOfCircle(5);`,
        score: 1,
        answer: `78.53982`
      },
      {
        program: `volumeOfSphere(5);`,
        score: 1,
        answer: `523.5988`
      }
    ],
    solutionTemplate: `function areaOfCircle(x) {
  // return area of circle
}

function volumeOfSphere(x) {
  // return volume of sphere
}`,
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    answer: 3,
    comment: '## Money trees is the *perfect place for shade* and ``` thats just how i feel ``` ',
    content:
      'This is the 3rd question. Oddly enough, it is an ungraded MCQ question that uses the curves library! Option C has a null hint!',
    choices: [
      {
        content: '**Option** `A`',
        hint: '_hint_ A is `here`'
      },
      {
        content: '### B',
        hint: 'hint B'
      },
      {
        content: 'C',
        hint: null
      },
      {
        content: 'D',
        hint: 'hint D'
      }
    ],
    id: 2,
    library: mockCurveLibrary,
    type: 'mcq',
    solution: 0,
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    answer: 3,
    comment: null,
    content:
      'This is the 4rth question. Oddly enough, it is a graded MCQ question that uses the curves library!',
    choices: [
      {
        content: 'A',
        hint: null
      },
      {
        content: 'B',
        hint: null
      },
      {
        content: 'C',
        hint: null
      },
      {
        content: 'D',
        hint: null
      }
    ],
    id: 3,
    library: mockCurveLibrary,
    type: 'mcq',
    solution: null,
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    autogradingResults: [],
    answer: null,
    comment: 'Wow you have come far! `Steady`',
    content: 'You have reached the last question! Have some fun with the tone matrix...',
    id: 4,
    library: mockToneMatrixLibrary,
    prepend: '',
    postpend: '',
    testcases: [],
    solutionTemplate: '5th question mock solution template',
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  }
];

export const mockClosedAssessmentQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    answer: `function fibonacci(n) {
  if (n <= 2) {
    return 1;
  } else {
    return fibonacci(n-1) + fibonacci(n-2);
  }
}`,
    comment: 'Wow you have come far! `Steady`',
    content: 'You can see autograding results!!!',
    id: 0,
    library: mockToneMatrixLibrary,
    prepend: '',
    postpend: "// This is a mock Postpend! You shouldn't be able to see me!",
    testcases: [
      {
        program: `fibonacci(3);`,
        score: 1,
        answer: `2`
      },
      {
        program: `fibonacci(4);`,
        score: 1,
        answer: `3`
      },
      {
        program: `fibonacci(5);`,
        score: 1,
        answer: `5`
      }
    ],
    solutionTemplate: 'Make Fibonacci!!!',
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2,
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
  }
];

/*
 * A few Assessments to try out in workspaces.
 */
export const mockAssessments: IAssessment[] = [
  {
    category: 'Mission',
    id: 1,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'An Odessey to Runes'
  },
  {
    category: 'Mission',
    id: 2,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'The Secret to Streams'
  },
  {
    category: AssessmentCategories.Sidequest,
    id: 3,
    longSummary: `###This is the sidequest briefing.

*Lorem ipsum* dolor sit amet, consectetur adipiscing elit.

> Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin
enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis
vestibulum.

- Etiam in egestas dolor.
- Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum,
  vel ornare metus turpis sed justo.
- Vivamus at tellus sed ex convallis commodo at in lectus.

\`\`\`
Pellentesque
pharetra
pulvinar
sapien
\`\`\``,
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'A sample Sidequest'
  },
  {
    category: AssessmentCategories.Mission,
    id: 4,
    longSummary:
      'This is the closed mission briefing. The save button should not be there. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockClosedAssessmentQuestions,
    title: 'A Closed Mission'
  }
];
