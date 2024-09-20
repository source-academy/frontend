import { Chapter } from 'js-slang/dist/types';

import { ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  AssessmentStatuses,
  IContestVotingQuestion,
  IMCQQuestion,
  IProgrammingQuestion,
  Library,
  TestcaseTypes
} from '../assessment/AssessmentTypes';

export const mockAssessmentConfigurations: AssessmentConfiguration[][] = [
  [
    {
      assessmentConfigId: 1,
      type: 'Missions',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 2,
      type: 'Quests',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 3,
      type: 'Paths',
      isManuallyGraded: false,
      isGradingAutoPublished: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 4,
      type: 'Contests',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: true,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 5,
      type: 'Others',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    }
  ],
  [
    {
      assessmentConfigId: 1,
      type: 'Mission Impossible',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 2,
      type: 'Data Structures',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 3,
      type: 'Algorithm Frenzy',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 200
    }
  ]
];

const mockUnopenedAssessmentsOverviews: AssessmentOverview[] = [
  {
    type: 'Missions',
    isManuallyGraded: true,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    id: 1,
    isPublished: false,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2038-06-18T05:24:26.026Z',
    title: 'An Odessey to Runes (Duplicate)',
    shortSummary:
      'This is a test for the UI of the unopened assessment overview. It links to the mock Mission 0',
    status: AssessmentStatuses.not_attempted,
    story: 'mission-1',
    xp: 0,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  }
];

const mockOpenedAssessmentsOverviews: AssessmentOverview[] = [
  {
    type: 'Missions',
    isManuallyGraded: true,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    id: 2,
    isPublished: false,
    maxXp: 1000,
    earlySubmissionXp: 0,
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
    isGradingPublished: false,
    maxTeamSize: 4,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Missions',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=World&font=lobster',
    id: 3,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'The Secret to Streams',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    status: AssessmentStatuses.attempting,
    story: 'mission-2',
    xp: 2,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Quests',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=Hello',
    id: 4,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'A sample Sidequest',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    status: AssessmentStatuses.not_attempted,
    story: 'sidequest-2.1',
    xp: 3,
    isGradingPublished: false,
    maxTeamSize: 2,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Paths',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: '2069-04-20T01:23:45.111Z',
    coverImage: 'https://fakeimg.pl/700x400/417678,64/?text=%E3%83%91%E3%82%B9&font=noto',
    id: 5,
    maxXp: 200,
    earlySubmissionXp: 0,
    openAt: '2018-01-01T00:00:00.000Z',
    title: 'Basic logic gates',
    shortSummary:
      'This mock path serves as a demonstration of the support provided for mock programming path functionality.',
    status: AssessmentStatuses.not_attempted,
    story: null,
    xp: 0,
    isGradingPublished: false,
    maxTeamSize: 2,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Others',
    isManuallyGraded: false,
    isPublished: false,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=Hello',
    id: 6,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'A sample Practical',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    status: AssessmentStatuses.not_attempted,
    story: 'sidequest-2.1',
    xp: 3,
    private: true,
    maxTeamSize: 1,
    isGradingPublished: false,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  }
];

const mockClosedAssessmentOverviews: AssessmentOverview[] = [
  {
    type: 'Missions',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    id: 7,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'A closed Mission',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is partially graded (undergoing manual grading). It should render as an orange clock.',
    status: AssessmentStatuses.submitted,
    story: 'mission-3',
    xp: 800,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Quests',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    id: 8,
    maxXp: 1000,
    earlySubmissionXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (not graded) Sidequest',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is not published. It should render as a yellow waiting clock.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 500,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Quests',
    isManuallyGraded: true,
    isPublished: true,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    id: 9,
    maxXp: 500,
    earlySubmissionXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (fully graded) Sidequest',
    shortSummary: `This is a test for the grading status tooltip when a manually graded assessment is fully graded but not published.
       It should still render as a yellow clock. This sidequest links to the mock Sidequest 4.`,
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 150,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  },
  {
    type: 'Paths',
    isManuallyGraded: false,
    isPublished: true,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    id: 10,
    maxXp: 0,
    earlySubmissionXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Ungraded assessment',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment does not require manual grading (e.g. paths and contests) but is unpublished. It should still render as a yellow clock. This sidequest links to the mock Sidequest 4.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 100,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  }
];

export const mockAssessmentOverviews = [
  ...mockUnopenedAssessmentsOverviews,
  ...mockOpenedAssessmentsOverviews,
  ...mockClosedAssessmentOverviews
];

export const mockLibrary: Library = {
  chapter: Chapter.SOURCE_1,
  external: {
    name: ExternalLibraryName.NONE,
    symbols: []
  },
  globals: []
};

export const mockAssessmentQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    autogradingResults: [],
    answer: null,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: `
  This question has an id of \`0\`.
  
  \`\`\`
  What's your favourite dinner food?
  \`\`\`
  `,
    id: 0,
    library: mockLibrary,
    prepend: `const pizza = "pizza";
  const sushi = "sushi";
  const chickenrice = "chicken rice";`,
    postpend: "// This is a mock Postpend! You shouldn't be able to see me!",
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `answer();`,
        score: 1,
        answer: `"pizza"`
      },
      {
        type: TestcaseTypes.public,
        program: `answer();`,
        score: 1,
        answer: `"sushi"`
      },
      {
        type: TestcaseTypes.public,
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
    xp: 0,
    maxXp: 2,
    blocking: false
  },
  {
    autogradingResults: [],
    answer: `function areaOfCircle(x) {
      return square(x) * pi;
  }
  
  function volumeOfSphere(x) {
      return 4 / 3 * cube(x) * pi;
  }`,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: 'Hello and welcome to this assessment! This is the 1st question.',
    id: 1,
    library: mockLibrary,
    prepend: `const square = x => x * x;
  const cube = x => x * x * x;
  const pi = 3.1415928;`,
    postpend: '',
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `areaOfCircle(5);`,
        score: 1,
        answer: `78.53982`
      },
      {
        type: TestcaseTypes.public,
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
    xp: 0,
    maxXp: 2,
    blocking: false
  },
  {
    answer: 3,
    content:
      'This is the 3rd question. Oddly enough, it is an ungraded MCQ question that uses the binary tree library! Option C has a null hint!',
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
    library: mockLibrary,
    type: 'mcq',
    solution: 0,
    xp: 0,
    maxXp: 2,
    blocking: false
  },
  {
    answer: 3,
    content:
      'This is the 4th question. Oddly enough, it is a graded MCQ question that uses the binary tree library!',
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
    library: mockLibrary,
    type: 'mcq',
    solution: undefined,
    xp: 0,
    maxXp: 2,
    blocking: false
  },
  {
    autogradingResults: [],
    answer: null,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: 'You have reached the last question! Have some fun with the tone matrix...',
    id: 4,
    library: mockLibrary,
    prepend: '',
    postpend: '',
    testcases: [],
    solutionTemplate: '5th question mock solution template',
    type: 'programming',
    xp: 0,
    maxXp: 2,
    blocking: false
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
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: 'You can see autograding results!!!',
    id: 0,
    library: mockLibrary,
    prepend: '',
    postpend: "// This is a mock Postpend! You shouldn't be able to see me!",
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `fibonacci(3);`,
        score: 1,
        answer: `2`
      },
      {
        type: TestcaseTypes.public,
        program: `fibonacci(4);`,
        score: 1,
        answer: `3`
      },
      {
        type: TestcaseTypes.public,
        program: `fibonacci(5);`,
        score: 1,
        answer: `5`
      }
    ],
    solutionTemplate: `function fibonacci(n) {
      // Your answer here
  }`,
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    maxXp: 2,
    blocking: false,
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
  
  ![](image-url-goes-here)`,
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
  {
    answer: `function recurse(rune, n) {
      return n <= 1 ? rune : make_cross(recurse(rune, n - 1));
  }`,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: 'This is a runes question - there are no testcases nor autograding results.',
    id: 1,
    library: mockLibrary,
    prepend: '',
    postpend: '',
    testcases: [],
    solutionTemplate: `function recurse(rune, n) {
      // Your answer here
  }`,
    type: 'programming',
    grader: {
      name: 'some avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    maxXp: 2,
    blocking: false,
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
      - [] Open the Pod Bay Doors`,
    autogradingResults: []
  }
];

export const mockPathQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    answer: null,
    content: 'As a recap: which of the following is not a valid logic gate?',
    choices: [
      {
        content: 'XOR gate',
        hint: 'This is the exclusive-OR gate!'
      },
      {
        content: 'IF gate',
        hint: 'Correct!'
      },
      {
        content: 'AND gate',
        hint: 'This logic gate exists!'
      },
      {
        content: 'OR gate',
        hint: 'This logic gate exists!'
      }
    ],
    id: 0,
    library: mockLibrary,
    type: 'mcq',
    solution: 1,
    xp: 0,
    maxXp: 0,
    blocking: false
  },
  {
    autogradingResults: [],
    answer: null,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: `An AND gate is a digital logic gate that implements logical conjunction on its inputs. It returns a single output that is HIGH (active) iff all the inputs to the AND gate are HIGH (active).
  
  In this question, let us model an AND gate as a function, and treat HIGH (active) inputs as the boolean value \`true\` and LOW (inactive) inputs as the boolean value \`false\`.
  
  As an AND gate is not restricted to exactly two inputs, our function shall be the same. Implement the function \`AND(inputs)\` which takes in the list \`inputs\` (a list of boolean values), and returns the output of the AND gate as a boolean. You may assume the list \`inputs\` is of minimum length 2.
  
  This question makes use of the sentinel function method to throw custom errors for each testcase.`,
    id: 1,
    library: mockLibrary,
    prepend: `const OR = (x, y) => x || y;`,
    postpend: `
  const __AND = (xs) => {
    if (AND(list(true, true)) === undefined) {
      error('Your function is empty!');
    } else {}
    
    const result = AND(xs);
  
    if (!is_boolean(result)) {
      error('Your function does not return a boolean!');
    } else {}
    
    if (equal(xs, list(true, false)) && result) {
      error('Check the truth table for an AND gate again!');
    } else if (equal(xs, list(true, true, false)) && result) {
      error('Are you using all inputs in the list?');
    } else if (equal(xs, list(true, true, true)) && !result) {
      error('Are you sure your base case is correct?');
    } else if (AND(list(true, true)) === AND(list(false, false))) {
      error('Oi! Do not hardcode values!');
    } else {
      return result;
    }
  };`,
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `__AND(list(true, false));`,
        score: 0,
        answer: `false`
      },
      {
        type: TestcaseTypes.public,
        program: `__AND(list(true, true, false));`,
        score: 0,
        answer: `false`
      },
      {
        type: TestcaseTypes.public,
        program: `__AND(list(true, OR(true, false), OR(true, true)));`,
        score: 0,
        answer: `true`
      },
      {
        type: TestcaseTypes.opaque,
        program: `__AND(list(true, OR(false, true), AND(list(true, false)), false));`,
        score: 0,
        answer: `false`
      },
      {
        type: TestcaseTypes.opaque,
        program: `__AND(list(true, OR(true, false), OR(true, AND(list(false, true))), true));`,
        score: 0,
        answer: `true`
      }
    ],
    solutionTemplate: `function AND(inputs) {
      // Your answer here!
  }`,
    type: 'programming',
    xp: 0,
    maxXp: 0,
    blocking: false
  },
  {
    autogradingResults: [],
    answer: null,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: `The XOR (exclusive-OR) gate is a digital logic gate that accepts two inputs and returns a single output that is HIGH (active) iff one of the inputs are HIGH (active), but not both.
  
  In this question, let us model the XOR gate as a function. Implement the function \`XOR(x, y)\` which takes two boolean inputs \`x\` and \`y\` and which returns the output of the XOR gate as a boolean.
  
  This question makes use of the wrapping container method to throw custom errors for each testcase.`,
    id: 2,
    library: mockLibrary,
    prepend: ``,
    postpend: `
  const __XOR = (x, y) => {
    if (XOR(false, false) === undefined) {
      error('Your function is empty!');
    } else {}
    
    const result = XOR(x, y);
  
    if (!is_boolean(result)) {
      error('Your function does not return a boolean!');
    } else {}
    
    if (((x && !y) || (y && !x)) && !result) {
      error('Check your truth tables!');
    } else if (XOR(false, false) === XOR(false, true)) {
      error('Oi! Do not hardcode values!');
    } else {
      return result;
    }
  };`,
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `__XOR(true, false);`,
        score: 0,
        answer: `true`
      },
      {
        type: TestcaseTypes.public,
        program: `__XOR(false, true);`,
        score: 0,
        answer: `true`
      },
      {
        type: TestcaseTypes.opaque,
        program: `__XOR(true, XOR(true, false));`,
        score: 0,
        answer: `false`
      }
    ],
    solutionTemplate: `function XOR(x, y) {
      // Your answer here!
  }`,
    type: 'programming',
    xp: 0,
    maxXp: 0,
    blocking: false
  },
  {
    autogradingResults: [],
    answer: null,
    lastModifiedAt: '2023-08-05T17:48:24.000000Z',
    content: `The NOR logic gate is special in that it is an _universal logic gate_, that is to say, they can be composed to form any other logic gate.
  
  Implement the AND logic gate **using ONLY the NOR logic gate**, as the \`NOR_AND(x, y)\` function that takes in two booleans as input.
  
  The \`NOR\` function modeled after a NOR gate is provided for you - it accepts two boolean values and returns \`true\` iff both inputs are \`false\`.`,
    id: 3,
    library: mockLibrary,
    prepend: `
  let counter = 0;
  const NOR = (x, y) => {
    counter = counter + 1;
    return !(x || y);
  };`,
    postpend: `
  const __NOR_AND = (x, y) => {
    if (NOR_AND(false, false) === undefined) {
      error('Your function is empty!');
    } else {}
    
    counter = 0;
    const result = NOR_AND(x, y);
  
    if (!is_boolean(result)) {
      error('Your function does not return a boolean!');
    } else {}
    
    if (!x && y && result) {
      error('Check your truth tables!');
    } else if (x && y && !result && counter > 0) {
      error('Nope! Try again :)');
    } else if (x && y && !result) {
      error('...You did not use NOR and still got it wrong!');
    } else if (x && y && result && counter !== 3) {
      error('Did you use NOR in your solution? >:(');
    } else if (x && !y && counter !== 6) {
      error('Incorrect number of calls.');
    } else {
      return result;
    }
  };`,
    testcases: [
      {
        type: TestcaseTypes.public,
        program: `__NOR_AND(false, true);`,
        score: 0,
        answer: `false`
      },
      {
        type: TestcaseTypes.public,
        program: `__NOR_AND(true, true);`,
        score: 0,
        answer: `true`
      },
      {
        type: TestcaseTypes.opaque,
        program: `__NOR_AND(true, NOR_AND(false, true));`,
        score: 0,
        answer: `false`
      }
    ],
    solutionTemplate: `function NOR_AND(x, y) {
      // Your answer here!
  }`,
    type: 'programming',
    xp: 0,
    maxXp: 0,
    blocking: false
  }
];

const mockContestEntryQuestion: Array<IContestVotingQuestion> = [
  {
    id: 0,
    type: 'voting',
    content: 'Sample Contest Voting Question',
    xp: 0,
    maxXp: 0,
    answer: [],
    prepend: '',
    postpend: '',
    contestEntries: [
      {
        submission_id: 1,
        answer: { code: "display('voting test')" }
      },
      {
        submission_id: 2,
        answer: { code: 'function voting_test() { return true; }' }
      }
    ],
    scoreLeaderboard: [
      {
        submission_id: 1,
        student_name: 'student_1',
        answer: { code: "display('score_leaderboard test')" }
      },
      {
        submission_id: 2,
        student_name: 'student_2',
        answer: { code: 'function score_leaderboard_test() { return true; }' }
      }
    ],
    popularVoteLeaderboard: [
      {
        submission_id: 1,
        student_name: 'student_1',
        answer: { code: "display('popular_vote_leaderboard test')" }
      },
      {
        submission_id: 2,
        student_name: 'student_2',
        answer: { code: 'function popular_vote_leaderboard_test() { return true; }' }
      }
    ],
    library: mockLibrary,
    blocking: false
  }
];

/*
 * A few Assessments to try out in workspaces.
 */
export const mockAssessments: Assessment[] = [
  {
    type: 'Missions',
    id: 1,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'An Odessey to Runes'
  },
  {
    type: 'Missions',
    id: 2,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'The Secret to Streams'
  },
  {
    type: 'Quests',
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
    type: 'Missions',
    id: 4,
    longSummary:
      'This is the closed mission briefing. The save button should not be there. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockClosedAssessmentQuestions,
    title: 'A Closed Mission'
  },
  {
    type: 'Quests',
    id: 5,
    longSummary:
      'This is the closed sidequest briefing. The save button should not exist. This is a placeholder sidequest for testing rendering of grading statuses.',
    missionPDF: 'www.google.com',
    questions: mockClosedAssessmentQuestions,
    title: 'A Closed Sidequest'
  },
  {
    type: 'Paths',
    id: 6,
    longSummary: `### Basic logic gates
  
  This path is intended to demonstrate concepts from the lecture **Logic Circuits**. You are strongly encouraged to attempt this path to check your understanding, prior to the next Studio session. For this, you will be granted a small amount of XP!
  
  The path comprises 4 questions and is fully autograded and guided, and there are **no private test cases** - there will be no manual review by default. Please consult your Avenger if you require assistance!</TEXT>`,
    missionPDF: 'www.google.com',
    questions: mockPathQuestions,
    title: 'A sample guided path'
  },
  // mock assessment used for testing contest voting assessments
  {
    type: 'Others',
    id: 7,
    title: 'A sample contest voting assessment',
    longSummary: 'Vote for your favourite contest entries here!',
    missionPDF: 'www.google.com',
    questions: mockContestEntryQuestion
  }
];
