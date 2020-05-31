import {
  AssessmentCategories,
  AssessmentStatuses,
  ExternalLibraryNames,
  GradingStatuses,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  Library,
  TestcaseTypes
} from '../components/assessment/assessmentShape';
import { externalLibraries } from '../reducers/externalLibraries';

const mockUnopenedAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 0,
    id: 1,
    maxGrade: 12,
    maxXp: 1000,
    openAt: '2038-06-18T05:24:26.026Z',
    title: 'An Odyssey to Runes Redux',
    shortSummary:
      'This is a test for the UI of the unopened assessment overview. This links to mock Mission 1 in an unattempted state.',
    status: AssessmentStatuses.not_attempted,
    story: 'mission-1',
    xp: 0,
    gradingStatus: GradingStatuses.none
  }
];

const mockOpenedAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 0,
    id: 1,
    maxGrade: 9,
    maxXp: 400,
    openAt: '2018-06-18T05:24:26.026Z',
    title: 'An Odyssey to Runes',
    shortSummary: `This shows the UI of an opened assessment overview, with a long assessment summary using Markdown for formatting. This links to mock Mission 1 in a completed state.

**NOTE**:
- Please refer to the following [link](https://www.google.com) for help.
- The **actual submission deadline** of this mission is __tomorrow__, unless you have *previously requested* for an extension.
- To submit, please make sure you have saved your work for every task/question, and then click \`Finalize Submission\` on this page.

##### The following hint may be useful:
\`\`\`javascript
const identity = x => x;
\`\`\``,
    status: AssessmentStatuses.attempted,
    story: 'mission-1',
    xp: 0,
    gradingStatus: GradingStatuses.none
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=World&font=lobster',
    grade: 0,
    id: 2,
    maxGrade: 11,
    maxXp: 1050,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'The Secret to Streams',
    shortSummary:
      'This shows the UI of an opened assessment overview. This links to mock Sidequest 3 in an attempted state, **thus the sidequest briefing is not displayed**.',
    status: AssessmentStatuses.attempting,
    story: 'mission-2',
    xp: 0,
    gradingStatus: GradingStatuses.none
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=Hello',
    grade: 0,
    id: 3,
    maxGrade: 7,
    maxXp: 725,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'A Sample Sidequest',
    shortSummary:
      'This is a placeholder quest summary. This links to mock Sidequest 3 in an unattempted state, **thus the sidequest briefing is displayed**.',
    status: AssessmentStatuses.not_attempted,
    story: 'sidequest-2.1',
    xp: 0,
    gradingStatus: GradingStatuses.none
  },
  {
    category: AssessmentCategories.Path,
    closeAt: '2069-04-20T01:23:45.111Z',
    coverImage: 'https://fakeimg.pl/700x400/417678,64/?text=%E3%83%91%E3%82%B9&font=noto',
    grade: 0,
    id: 6,
    maxGrade: 0,
    maxXp: 0,
    openAt: '2018-01-01T00:00:00.000Z',
    title: 'Basic Logic',
    shortSummary:
      'This mock path serves as a demonstration of the support provided for mock programming path functionality. This links to mock Path 6 in an unattempted state, **thus the path briefing is displayed**.',
    status: AssessmentStatuses.not_attempted,
    story: null,
    xp: 0,
    gradingStatus: GradingStatuses.excluded
  },
  {
    category: AssessmentCategories.Practical,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=Hello',
    grade: 0,
    id: 8,
    maxGrade: 48,
    maxXp: 0,
    openAt: '2018-07-18T05:24:26.026Z',
    title: 'A Sample Practical',
    shortSummary:
      'This is a placeholder summary for a practical assessment. This links to mock Practical 4 in an unattempted state.',
    status: AssessmentStatuses.not_attempted,
    story: 'sidequest-2.1',
    xp: 0,
    gradingStatus: GradingStatuses.none,
    private: true
  },
  {
    category: AssessmentCategories.Mission,
    closeAt: '2069-04-20T23:59:59.999Z',
    coverImage: 'https://fakeimg.pl/350x200/?text=World&font=lobster',
    grade: 0,
    id: 7,
    maxGrade: 0,
    maxXp: 666,
    openAt: '2020-03-21T00:00:00.000Z',
    title: 'Symphony of the Winds',
    shortSummary:
      'This shows the UI of an opened assessment overview. This links to mock Mission 7 in an unattempted state, **thus the mission briefing is displayed**.',
    status: AssessmentStatuses.not_attempted,
    story: null,
    xp: 0,
    gradingStatus: GradingStatuses.none
  }
];

const mockClosedAssessmentOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    grade: 9,
    id: 4,
    maxGrade: 11,
    maxXp: 420,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'A Closed Mission',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is fully graded. It should render as a green tick. This links to the mock Mission 2 in a completed state.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 468,
    gradingStatus: GradingStatuses.graded
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    grade: 0,
    id: 5,
    maxGrade: 13,
    maxXp: 850,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (not graded) Sidequest',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is not graded. It should render as a red cross. This links to the mock Sidequest 5 in a completed state.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 0,
    gradingStatus: GradingStatuses.none
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000,128/000,255',
    grade: 6,
    id: 5,
    maxGrade: 14,
    maxXp: 1100,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Closed (partially graded) Sidequest',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment is partially graded (undergoing manual grading). It should render as an orange clock. This links to the mock Sidequest 5 in a completed state.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 471,
    gradingStatus: GradingStatuses.grading
  },
  {
    category: AssessmentCategories.Path,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'https://fakeimg.pl/350x200/ff0000/000',
    grade: 0,
    id: 5,
    maxGrade: 0,
    maxXp: 0,
    openAt: '2007-07-18T05:24:26.026Z',
    title: 'Ungraded Assessment',
    shortSummary:
      'This is a test for the grading status tooltip when the assessment does not require manual grading (e.g. paths and contests). It should render as a blue disable sign. This links to the mock Sidequest 5 in a completed state.',
    status: AssessmentStatuses.submitted,
    story: null,
    xp: 100,
    gradingStatus: GradingStatuses.excluded
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
  chapter: 4,
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
  chapter: 4,
  external: {
    name: ExternalLibraryNames.CURVES,
    symbols: externalLibraries.get(ExternalLibraryNames.CURVES)!
  },
  globals: mockGlobals
};

const mockToneMatrixLibrary: Library = {
  chapter: 4,
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
    roomId: null,
    id: 0,
    library: mockSoundLibrary,
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
    roomId: '19422043',
    content: 'Hello and welcome to this assessment! This is the 1st question.',
    id: 1,
    library: mockRuneLibrary,
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
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    answer: 3,
    roomId: '19422046',
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
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    answer: 3,
    roomId: null,
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
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  },
  {
    autogradingResults: [],
    answer: null,
    roomId: '19422032',
    content: 'You have reached the last question! Have some fun with the tone matrix...',
    id: 4,
    library: mockToneMatrixLibrary,
    prepend: '',
    postpend: '',
    testcases: [],
    solutionTemplate: '5th question mock solution template',
    type: 'programming',
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
    roomId: '19422032',
    content: 'You can see autograding results!!!',
    id: 0,
    library: mockCurveLibrary,
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
    grade: 0,
    maxGrade: 2,
    maxXp: 2,
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
    roomId: '19422033',
    content: 'This is a runes question - there are no testcases nor autograding results.',
    id: 1,
    library: mockRuneLibrary,
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
    grade: 0,
    maxGrade: 2,
    maxXp: 2,
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
    roomId: null,
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
    library: mockRuneLibrary,
    type: 'mcq',
    solution: 1,
    xp: 0,
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  },
  {
    autogradingResults: [],
    answer: null,
    roomId: null,
    content: `An AND gate is a digital logic gate that implements logical conjunction on its inputs. It returns a single output that is HIGH (active) iff all the inputs to the AND gate are HIGH (active).

In this question, let us model an AND gate as a function, and treat HIGH (active) inputs as the boolean value \`true\` and LOW (inactive) inputs as the boolean value \`false\`.

As an AND gate is not restricted to exactly two inputs, our function shall be the same. Implement the function \`AND(inputs)\` which takes in the list \`inputs\` (a list of boolean values), and returns the output of the AND gate as a boolean. You may assume the list \`inputs\` is of minimum length 2.

This question makes use of the sentinel function method to throw custom errors for each testcase.`,
    id: 1,
    library: mockRuneLibrary,
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
        type: TestcaseTypes.hidden,
        program: `__AND(list(true, OR(false, true), AND(list(true, false)), false));`,
        score: 0,
        answer: `false`
      },
      {
        type: TestcaseTypes.hidden,
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
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  },
  {
    autogradingResults: [],
    answer: null,
    roomId: null,
    content: `The XOR (exclusive-OR) gate is a digital logic gate that accepts two inputs and returns a single output that is HIGH (active) iff one of the inputs are HIGH (active), but not both.

In this question, let us model the XOR gate as a function. Implement the function \`XOR(x, y)\` which takes two boolean inputs \`x\` and \`y\` and which returns the output of the XOR gate as a boolean.

This question makes use of the wrapping container method to throw custom errors for each testcase.`,
    id: 2,
    library: mockRuneLibrary,
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
        type: TestcaseTypes.hidden,
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
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  },
  {
    autogradingResults: [],
    answer: null,
    roomId: null,
    content: `The NOR logic gate is special in that it is an _universal logic gate_, that is to say, they can be composed to form any other logic gate.

Implement the AND logic gate **using ONLY the NOR logic gate**, as the \`NOR_AND(x, y)\` function that takes in two booleans as input.

The \`NOR\` function modeled after a NOR gate is provided for you - it accepts two boolean values and returns \`true\` iff both inputs are \`false\`.`,
    id: 3,
    library: mockRuneLibrary,
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
        type: TestcaseTypes.hidden,
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
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  }
];

/*
 * A few Assessments to try out in workspaces.
 */
export const mockAssessments: IAssessment[] = [
  {
    category: AssessmentCategories.Mission,
    id: 1,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'An Odessey to Runes'
  },
  {
    category: AssessmentCategories.Mission,
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
    title: 'A Sample Sidequest'
  },
  {
    category: AssessmentCategories.Mission,
    id: 4,
    longSummary: 'This is a closed mission. The save button should not be rendered.',
    missionPDF: 'www.google.com',
    questions: mockClosedAssessmentQuestions,
    title: 'A Closed Mission'
  },
  {
    category: AssessmentCategories.Sidequest,
    id: 5,
    longSummary:
      'This is the closed sidequest briefing. The save button should not be there. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockClosedAssessmentQuestions,
    title: 'A Closed Sidequest'
  },
  {
    category: AssessmentCategories.Path,
    id: 6,
    longSummary: `### Basic Logic Gates

This path is intended to demonstrate concepts from the lecture **Logic Circuits**. You are strongly encouraged to attempt this path to check your understanding, prior to the next Studio session. For this, you will be granted a small amount of XP!

The path comprises 4 questions and is fully autograded and guided, and there are **no private test cases** - there will be no manual review by default. Please consult your Avenger if you require assistance!</TEXT>`,
    missionPDF: 'www.google.com',
    questions: mockPathQuestions,
    title: 'A Sample Guided Path'
  },
  {
    category: AssessmentCategories.Mission,
    id: 7,
    longSummary: `###This is a long sidequest briefing for testing purposes!

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Metus aliquam eleifend mi in. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra. Neque volutpat ac tincidunt vitae semper quis lectus nulla. In hac habitasse platea dictumst vestibulum rhoncus. Nisl vel pretium lectus quam id leo in. Diam donec adipiscing tristique risus. Accumsan tortor posuere ac ut consequat. Felis bibendum ut tristique et egestas quis ipsum. Mi eget mauris pharetra et ultrices. Ornare aenean euismod elementum nisi. Sem viverra aliquet eget sit amet tellus. Massa enim nec dui nunc mattis enim ut tellus elementum. Venenatis cras sed felis eget velit aliquet sagittis id. Placerat duis ultricies lacus sed turpis tincidunt id. Eu lobortis elementum nibh tellus molestie nunc.

Enim eu turpis egestas pretium. Pharetra convallis posuere morbi leo urna molestie at elementum eu. Sed enim ut sem viverra aliquet eget sit amet. Ligula ullamcorper malesuada proin libero nunc consequat interdum. Dignissim suspendisse in est ante in nibh mauris. Urna id volutpat lacus laoreet non curabitur gravida arcu ac. Nibh mauris cursus mattis molestie a iaculis at. Elit at imperdiet dui accumsan sit. Nibh venenatis cras sed felis. Ut tristique et egestas quis ipsum suspendisse ultrices gravida. Natoque penatibus et magnis dis parturient montes nascetur ridiculus. Eget aliquet nibh praesent tristique magna sit amet purus gravida. Pretium nibh ipsum consequat nisl vel pretium. Mattis vulputate enim nulla aliquet porttitor lacus. Quis varius quam quisque id diam. Ut sem viverra aliquet eget sit amet tellus. Purus non enim praesent elementum facilisis leo vel fringilla est. Tellus id interdum velit laoreet. Sed felis eget velit aliquet sagittis id consectetur.

Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum. Mi tempus imperdiet nulla malesuada. Sagittis aliquam malesuada bibendum arcu. Lobortis feugiat vivamus at augue eget arcu. Urna neque viverra justo nec ultrices dui sapien eget mi. Quisque non tellus orci ac auctor augue mauris augue neque. Bibendum neque egestas congue quisque egestas diam in arcu cursus. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui. Nunc sed blandit libero volutpat sed cras ornare arcu. Aenean euismod elementum nisi quis. Duis at consectetur lorem donec massa sapien faucibus. Justo donec enim diam vulputate. Velit ut tortor pretium viverra suspendisse. Tellus rutrum tellus pellentesque eu. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt.

Pellentesque habitant morbi tristique senectus et netus et malesuada. Ut placerat orci nulla pellentesque dignissim. Vitae tempus quam pellentesque nec nam aliquam sem et. Praesent semper feugiat nibh sed pulvinar. Netus et malesuada fames ac turpis egestas maecenas. Nisi lacus sed viverra tellus. Pharetra vel turpis nunc eget lorem dolor sed viverra ipsum. Dui sapien eget mi proin sed libero. Habitant morbi tristique senectus et netus et malesuada. In hendrerit gravida rutrum quisque. Nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus.`,
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'Symphony of the Winds'
  },
  {
    category: AssessmentCategories.Practical,
    id: 8,
    longSummary: `### Instructions (please read carefully)
- You are allowed X minutes for this Practical Assessment.
- This is an open-book assessment. Any written or printed material, or material and programs stored on the Source Academy may be used as reference material.`,
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'A Sample Practical'
  }
];
