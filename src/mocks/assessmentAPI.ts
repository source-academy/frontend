import {
  AssessmentCategories,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  Library
} from '../components/assessment/assessmentShape'

const mockOpenAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'www.imgur.com',
    id: 0,
    maximumEXP: 3000,
    openAt: '2018-06-18T05:24:26.026Z',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'An Odessey to Runes'
  },
  {
    category: AssessmentCategories.Mission,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'www.imgur.com',
    id: 1,
    maximumEXP: 3000,
    openAt: '2018-07-18T05:24:26.026Z',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'The Secret to Streams'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2048-06-18T05:24:26.026Z',
    coverImage: 'www.imgur.com',
    id: 2,
    maximumEXP: 3000,
    openAt: '2018-07-18T05:24:26.026Z',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'A sample Sidequest'
  }
]

const mockClosedAssessmentOverviews: IAssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'www.imgur.com',
    id: 3,
    maximumEXP: 3000,
    openAt: '2007-07-18T05:24:26.026Z',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'A closed Mission'
  },
  {
    category: AssessmentCategories.Sidequest,
    closeAt: '2008-06-18T05:24:26.026Z',
    coverImage: 'www.imgur.com',
    id: 4,
    maximumEXP: 3000,
    openAt: '2007-07-18T05:24:26.026Z',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'A closed sidequest'
  }
]

export const mockAssessmentOverviews = [
  ...mockOpenAssessmentsOverviews,
  ...mockClosedAssessmentOverviews
]

export const mockLibrary: Library = {
  chapter: 1,
  externals: ['make_sourcesound', 'array_test', 'draw_connected'],
  files: ['mockLibraryFile'],
  globals: ['mockLibraryGlobal']
}

export const mockAssessmentQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    content: 'Hello and welcome to this assessment! This is the 0th question.',
    id: 0,
    library: mockLibrary,
    solutionTemplate: '0th question mock solution template',
    type: 'programming'
  },
  {
    content: 'Hello and welcome to this assessment! This is the 1st question.',
    id: 1,
    library: mockLibrary,
    solutionTemplate: '1st question mock solution template',
    type: 'programming'
  },
  {
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
    type: 'mcq'
  }
]

/*
 * A few Assessments to try out in workspaces.
 */
export const mockAssessments: IAssessment[] = [
  {
    category: 'Mission',
    id: 0,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'An Odessey to Runes'
  },
  {
    category: 'Mission',
    id: 1,
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'The Secret to Streams'
  },
  {
    category: AssessmentCategories.Sidequest,
    id: 2,
    longSummary:
      'This is the sidequest briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'A sample Sidequest'
  },
  {
    category: AssessmentCategories.Mission,
    id: 3,
    longSummary:
      'This is the closed mission briefing. The save button should not be there. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    questions: mockAssessmentQuestions,
    title: 'A Closed Mission'
  }
]
