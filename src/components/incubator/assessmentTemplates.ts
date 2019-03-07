import {
  AssessmentCategories,
  AssessmentStatuses,
  IAssessment,
  IAssessmentOverview,
  IProgrammingQuestion,
} from '../../components/assessment/assessmentShape'
import { mock2DRuneLibrary } from '../../mocks/assessmentAPI'

export const overviewTemplate: IAssessmentOverview =
  {
    category: AssessmentCategories.Mission,
    closeAt: "2100-12-01T00:00+08",
    coverImage: 'https://fakeimg.pl/300/',
    grade: 1,
    id: -1,
    maxGrade: 0,
    maxXp: 0,
    openAt: "2000-01-01T00:00+08",
    title: 'Insert title here',
    shortSummary:
      'Insert short summary here',
    status: AssessmentStatuses.not_attempted,
    story: 'mission',
    xp: 0,
    gradingStatus: 'none'
  }
  
export const questionsTemplate: IProgrammingQuestion[] = [{
    answer: null,
    comment: '`Great Job` **young padawan**',
    content: 'Enter content here',
    id: 0,
    library: mock2DRuneLibrary,
    solutionTemplate: '//1st question mock solution template',
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
  }]

export const assessmentTemplate: IAssessment = {
    category: 'Mission',
    id: -1,
    longSummary:
      'Insert mission briefing here',
    missionPDF: 'www.google.com',
    questions: questionsTemplate,
    title: 'Insert title here'
  }