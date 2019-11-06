import {
  AssessmentCategories,
  AssessmentStatuses,
  ExternalLibraryName,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  ITestcase,
  Library,
  TestcaseTypes
} from '../../components/assessment/assessmentShape';

export const emptyLibrary = (): Library => {
  return {
    chapter: -1,
    external: {
      name: 'NONE' as ExternalLibraryName,
      symbols: []
    },
    globals: []
  };
};

export const normalLibrary = (): Library => {
  return {
    chapter: 1,
    external: {
      name: 'NONE' as ExternalLibraryName,
      symbols: []
    },
    globals: []
  };
};

export const overviewTemplate = (): IAssessmentOverview => {
  return {
    category: AssessmentCategories.Mission,
    closeAt: '2100-12-01T00:00+08',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 1,
    id: -1,
    maxGrade: 0,
    maxXp: 0,
    openAt: '2000-01-01T00:00+08',
    title: 'Insert title here',
    reading: '',
    shortSummary: 'Insert short summary here',
    status: AssessmentStatuses.not_attempted,
    story: 'mission',
    xp: 0,
    gradingStatus: 'none'
  };
};

export const programmingTemplate = (): IProgrammingQuestion => {
  return {
    autogradingResults: [],
    answer: '// [Marking Scheme]\n// 1 mark for correct answer',
    roomId: '19422043',
    content: 'Enter content here',
    id: 0,
    library: emptyLibrary(),
    graderLibrary: emptyLibrary(),
    prepend: '',
    solutionTemplate: '//This is a mock solution template',
    postpend: '',
    testcases: [],
    testcasesPrivate: [],
    type: 'programming',
    xp: 0,
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  };
};

export const testcaseTemplate = (): ITestcase => {
  return {
    type: TestcaseTypes.public,
    answer: '',
    score: 0,
    program: ''
  };
};

export const mcqTemplate = (): IMCQQuestion => {
  return {
    answer: 3,
    roomId: null,
    content: 'This is a mock MCQ question',
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
    id: 2,
    library: emptyLibrary(),
    graderLibrary: emptyLibrary(),
    type: 'mcq',
    solution: 0,
    xp: 0,
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  };
};

export const assessmentTemplate = (): IAssessment => {
  return {
    category: 'Mission',
    globalDeployment: normalLibrary(),
    graderDeployment: emptyLibrary(),
    id: -1,
    longSummary: 'Insert mission briefing here',
    missionPDF: 'www.google.com',
    questions: [programmingTemplate()],
    title: 'Insert title here'
  };
};
