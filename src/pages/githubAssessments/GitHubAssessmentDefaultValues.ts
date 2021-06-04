import { IMCQQuestion } from '../../commons/assessment/AssessmentTypes';
import { MissionMetadata, TaskData } from '../../commons/githubAssessments/GitHubMissionTypes';

export const defaultMissionBriefing =
  'Welcome to Mission Mode! This is where the Mission Briefing for each assignment will appear.';

export const defaultTaskDescription =
  'Welcome to Mission Mode! This is where the Task Description for each assignment will appear.';

export const defaultStarterCode = '// Your code here!\n';

export const defaultMissionMetadata = {
  coverImage: '',
  kind: '',
  number: '',
  title: '',
  sourceVersion: 1,
  dueDate: new Date(8640000000000000),
  reading: '',
  webSummary: ''
} as MissionMetadata;

export const defaultTask = {
  questionNumber: 0,
  taskDescription: defaultTaskDescription,
  starterCode: defaultStarterCode,
  savedCode: defaultStarterCode,
  testPrepend: '',
  testPostpend: '',
  testCases: []
} as TaskData;

export const defaultMCQQuestion = {
  answer: -1,
  choices: [],
  solution: -1,
  type: 'mcq',
  content: '',
  grade: 0,
  id: 0,
  library: { chapter: 4, external: { name: 'NONE', symbols: [] }, globals: [] },
  maxGrade: 0,
  xp: 0,
  maxXp: 0
} as IMCQQuestion;
