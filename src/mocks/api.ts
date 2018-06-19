import {
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  Library
} from '../components/assessment/assessmentShape'

const mockOpenAssessmentsOverviews: IAssessmentOverview[] = [
  {
    category: 'Mission',
    coverImage: 'www.imgur.com',
    closeAt: '2048-06-18T05:24:26.026Z',
    id: 0,
    maximumEXP: 3000,
    openAt: '2018-06-18T05:24:26.026Z',
    order: 0,
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'An Odessey to Runes'
  },
  {
    category: 'Mission',
    coverImage: 'www.imgur.com',
    closeAt: '2048-06-18T05:24:26.026Z',
    id: 1,
    maximumEXP: 3000,
    openAt: '2018-07-18T05:24:26.026Z',
    order: 1,
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'The Secret to Streams'
  },
  {
    category: 'Sidequest',
    coverImage: 'www.imgur.com',
    closeAt: '2048-06-18T05:24:26.026Z',
    id: 2,
    maximumEXP: 3000,
    openAt: '2018-07-18T05:24:26.026Z',
    order: 2,
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'A sample Sidequest'
  }
]

const mockClosedAssessmentOverviews: IAssessmentOverview[] = [
  {
    category: 'Mission',
    coverImage: 'www.imgur.com',
    closeAt: '2008-06-18T05:24:26.026Z',
    id: 3,
    order: 5,
    openAt: '2007-07-18T05:24:26.026Z',
    maximumEXP: 3000,
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    title: 'A closed Mission'
  },
  {
    title: 'A closed sidequest',
    shortSummary:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    order: 4,
    openAt: '2007-07-18T05:24:26.026Z',
    maximumEXP: 3000,
    id: 4,
    coverImage: 'www.imgur.com',
    closeAt: '2008-06-18T05:24:26.026Z',
    category: 'Sidequest'
  }
]

export const mockAssessmentOverviews = [
  ...mockOpenAssessmentsOverviews,
  ...mockClosedAssessmentOverviews
]

const mockLibrary: Library = {
  globals: ['mockLibraryGlobal'],
  files: ['mockLibraryFile'],
  externals: ['mockLibraryExternal'],
  chapter: 1
}

export const mockAssessmentQuestions: Array<IProgrammingQuestion | IMCQQuestion> = [
  {
    type: 'programming',
    solutionTemplate: '0th question mock solution template',
    id: 0,
    library: mockLibrary,
    content: 'Hello and welcome to this assessment! This is the 0th question.'
  },
  {
    type: 'programming',
    solutionTemplate: '1st question mock solution template',
    id: 1,
    library: mockLibrary,
    content: 'Hello and welcome to this assessment! This is the 1st question.'
  },
  {
    id: 2,
    type: 'mcq',
    content:
      'Hello and welcome to this assessment! This is the 2nd question. Oddly enough, it is an MCQ question!',
    choices: [
      {
        hint: 'hint A',
        content: 'A'
      },
      {
        hint: 'hint B',
        content: 'B'
      },
      {
        hint: 'hint C',
        content: 'C'
      },
      {
        hint: 'hint D',
        content: 'D'
      }
    ]
  }
]

/*
 * A few Assessments to try out in workspaces.
 */
export const mockAssessments: IAssessment[] = [
  {
    title: 'An Odessey to Runes',
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    id: 0,
    category: 'Mission',
    questions: mockAssessmentQuestions
  },
  {
    title: 'The Secret to Streams',
    longSummary:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    id: 1,
    category: 'Mission',
    questions: mockAssessmentQuestions
  },
  {
    title: 'A sample Sidequest',
    longSummary:
      'This is the sidequest briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    missionPDF: 'www.google.com',
    id: 2,
    category: 'Sidequest',
    questions: mockAssessmentQuestions
  }
]
