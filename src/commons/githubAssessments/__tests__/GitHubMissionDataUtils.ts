import { Octokit } from '@octokit/rest';

import { IMCQQuestion } from '../../assessment/AssessmentTypes';
import * as GitHubMissionDataUtils from '../GitHubMissionDataUtils';
import { MissionMetadata, MissionRepoData } from '../GitHubMissionTypes';

test('getContentAsString correctly gets content and translates from Base64 to utf-8', async () => {
  const octokit = new Octokit();
  const getContentMock = jest.spyOn(octokit.repos, 'getContent');

  getContentMock.mockImplementationOnce(async () => {
    const contentResponse = generateGetContentResponse();
    (contentResponse.data as any).content = Buffer.from('Hello World!', 'utf8').toString('base64');
    return contentResponse;
  });

  const content = await GitHubMissionDataUtils.getContentAsString(
    'dummy owner',
    'dummy repo',
    'dummy path',
    octokit
  );
  expect(content).toBe('Hello World!');
});

test('parseMetadataProperties correctly discovers properties', () => {
  const missionMetadata = Object.assign({}, dummyMissionMetadata);
  const stringPropsToExtract = ['coverImage', 'kind', 'number', 'title', 'reading', 'webSummary'];
  const numPropsToExtract = ['sourceVersion'];
  const datePropsToExtract = ['dueDate'];

  const metadataString =
    'coverImage=www.somelink.com\n' +
    'kind=Mission\n' +
    'number=M3\n' +
    'title=Dummy Mission\n' +
    'reading=Textbook Pages 1 to 234763\n' +
    'dueDate=December 17, 1995 03:24:00\n' +
    'webSummary=no\n' +
    'sourceVersion=3';

  const retVal = GitHubMissionDataUtils.parseMetadataProperties<MissionMetadata>(
    missionMetadata,
    stringPropsToExtract,
    numPropsToExtract,
    datePropsToExtract,
    metadataString
  );

  expect(retVal.coverImage).toBe('www.somelink.com');
  expect(retVal.kind).toBe('Mission');
  expect(retVal.number).toBe('M3');
  expect(retVal.title).toBe('Dummy Mission');
  expect(retVal.reading).toBe('Textbook Pages 1 to 234763');
  expect(retVal.webSummary).toBe('no');
  expect(retVal.sourceVersion).toBe(3);
  expect(retVal.dueDate).toStrictEqual(new Date('December 17, 1995 03:24:00'));
});

test('getMissionData works properly', async () => {
  const missionRepoData: MissionRepoData = {
    repoOwner: 'Pain',
    repoName: 'Peko',
    dateOfCreation: new Date('December 17, 1995 03:24:00')
  };

  const octokit = new Octokit();
  const getContentMock = jest.spyOn(octokit.repos, 'getContent');
  getContentMock
    .mockImplementationOnce(async () => {
      // Briefing String
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Briefing Content', 'utf8').toString(
        'base64'
      );
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Metadata String
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from(
        'coverImage=www.somelink.com\n' +
          'kind=Mission\n' +
          'number=M3\n' +
          'title=Dummy Mission\n' +
          'reading=Textbook Pages 1 to 234763\n' +
          'webSummary=no\n' +
          'sourceVersion=3',
        'utf-8'
      ).toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Get files/folders at root
      const contentResponse = generateGetContentResponse() as {
        url: any;
        status: any;
        headers: any;
        data: any;
      };
      contentResponse.data = [generateGitHubSubDirectory('Q1'), generateGitHubSubDirectory('Q2')];
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Get folder contents for Q1
      const contentResponse = generateGetContentResponse() as {
        url: any;
        status: any;
        headers: any;
        data: any;
      };
      contentResponse.data = [
        generateGitHubSubDirectory('Problem.md'),
        generateGitHubSubDirectory('StarterCode.js')
      ];
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Folder contents for Q2
      const contentResponse = generateGetContentResponse();
      contentResponse.data = [
        generateGitHubSubDirectory('Problem.md'),
        generateGitHubSubDirectory('StarterCode.js'),
        generateGitHubSubDirectory('SavedCode.js'),
        generateGitHubSubDirectory('TestPrepend.js'),
        generateGitHubSubDirectory('TestCases.json')
      ];
      //(contentResponse.data as any).content = Buffer.from('SavedCode A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q1/Problem.md
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Task A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q1/StarterCode.js
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q2/Problem.md
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Task B', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q2/StarterCode.js
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code B', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q2/SavedCode.js
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code C', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q2/TestPrepend.js
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code D', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // Q2/TestCases.json
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from(
        `[{
        "answer": "[[1, [2, [3, null]]], [4, [5, null]]]",
        "program": "sort_pair_of_lists(pair(list(2, 1, 3), list(5, 4)));"
      }]`,
        'utf8'
      ).toString('base64');
      return contentResponse;
    });

  const missionData = await GitHubMissionDataUtils.getMissionData(missionRepoData, octokit);

  expect(missionData.missionRepoData.repoOwner).toBe('Pain');
  expect(missionData.missionRepoData.repoName).toBe('Peko');

  expect(missionData.missionBriefing).toBe('Briefing Content');

  expect(missionData.missionMetadata.coverImage).toBe('www.somelink.com');
  expect(missionData.missionMetadata.kind).toBe('Mission');
  expect(missionData.missionMetadata.number).toBe('M3');
  expect(missionData.missionMetadata.title).toBe('Dummy Mission');
  expect(missionData.missionMetadata.reading).toBe('Textbook Pages 1 to 234763');
  expect(missionData.missionMetadata.webSummary).toBe('no');
  expect(missionData.missionMetadata.sourceVersion).toBe(3);

  expect(missionData.tasksData.length).toBe(2);

  expect(missionData.tasksData[0]).toEqual({
    questionNumber: 1,
    taskDescription: 'Task A',
    starterCode: 'Code A',
    savedCode: 'Code A',
    testPrepend: '',
    testPostpend: '',
    testCases: []
  });
  expect(missionData.tasksData[1]).toEqual({
    questionNumber: 2,
    taskDescription: 'Task B',
    starterCode: 'Code B',
    savedCode: 'Code C',
    testPrepend: 'Code D',
    testPostpend: '',
    testCases: [
      {
        answer: '[[1, [2, [3, null]]], [4, [5, null]]]',
        program: 'sort_pair_of_lists(pair(list(2, 1, 3), list(5, 4)));'
      }
    ]
  });
});

test('discoverFilesToBeChangedWithMissionRepoData discovers files to create', () => {
  // missionMetadata and cachedMissionMetadata have the same values
  // briefingContent and cachedBriefingContent have the same values
  // taskList is longer than cachedTaskList
  // taskList shares one task with cachedTaskList

  const missionMetadata = Object.assign(dummyMissionMetadata);
  const cachedMissionMetadata = Object.assign(dummyMissionMetadata);

  const briefingContent = 'dummy';
  const cachedBriefingContent = 'dummy';

  const taskList = [
    {
      questionNumber: 1,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];
  const cachedTaskList = [
    {
      questionNumber: 1,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const isTeacherMode = false;

  const [filenameToContentMap, foldersToDelete] =
    GitHubMissionDataUtils.discoverFilesToBeChangedWithMissionRepoData(
      missionMetadata,
      cachedMissionMetadata,
      briefingContent,
      cachedBriefingContent,
      taskList,
      cachedTaskList,
      isTeacherMode
    );

  const existingKeys = new Set();

  Object.keys(filenameToContentMap).forEach((key: string) => existingKeys.add(key));

  const expectedKeys = new Set([
    'Q2/StarterCode.js',
    'Q2/Problem.md',
    'Q2/TestCases.json',
    'Q2/TestPrepend.js',
    'Q2/TestPostpend.js'
  ]);

  expect(existingKeys).toEqual(expectedKeys);
  expect(foldersToDelete.length).toBe(0);
});

test('discoverFilesToBeChangedWithMissionRepoData discovers files to edit in Non-Teacher Mode', () => {
  // missionMetadata and cachedMissionMetadata have different values
  // briefingContent and cachedBriefingContent have different values
  // taskList is the same length as cachedTaskList
  // taskList shares one task with cachedTaskList
  // Expect: metadata and readme, as well as different files from Q1, Q2 and Q3 to be changed

  const missionMetadata = Object.assign(dummyMissionMetadata);
  const cachedMissionMetadata = Object.assign(defaultMissionMetadata);

  const briefingContent = 'new dummy';
  const cachedBriefingContent = 'dummy';

  const taskList = [
    {
      questionNumber: 1,
      taskDescription: 'change',
      starterCode: 'starter',
      savedCode: 'change',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'change',
      testPostpend: 'change',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 3,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        },
        {
          answer: 'another',
          program: 'testcase',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const cachedTaskList = [
    {
      questionNumber: 1,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 3,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const isTeacherMode = false;

  const [filenameToContentMap, foldersToDelete] =
    GitHubMissionDataUtils.discoverFilesToBeChangedWithMissionRepoData(
      missionMetadata,
      cachedMissionMetadata,
      briefingContent,
      cachedBriefingContent,
      taskList,
      cachedTaskList,
      isTeacherMode
    );

  const existingKeys = new Set();

  Object.keys(filenameToContentMap).forEach((key: string) => existingKeys.add(key));

  const expectedKeys = new Set([
    '.metadata',
    'README.md',
    'Q1/SavedCode.js',
    'Q1/Problem.md',
    'Q2/TestPrepend.js',
    'Q2/TestPostpend.js',
    'Q3/TestCases.json'
  ]);

  expect(existingKeys).toEqual(expectedKeys);
  expect(foldersToDelete.length).toBe(0);
});

test('discoverFilesToBeChangedWithMissionRepoData discovers files to edit in Teacher Mode', () => {
  // Test inputs should be same as above, but with isTeacherMode set to true
  // This will turn any edits to 'SavedCode.js' into edits to 'StarterCode.js'
  const missionMetadata = Object.assign(dummyMissionMetadata);
  const cachedMissionMetadata = Object.assign(defaultMissionMetadata);

  const briefingContent = 'new dummy';
  const cachedBriefingContent = 'dummy';

  const taskList = [
    {
      questionNumber: 1,
      taskDescription: 'change',
      starterCode: 'starter',
      savedCode: 'change',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'change',
      testPostpend: 'change',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 3,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        },
        {
          answer: 'another',
          program: 'testcase',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const cachedTaskList = [
    {
      questionNumber: 1,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 3,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const isTeacherMode = true;

  const [filenameToContentMap, foldersToDelete] =
    GitHubMissionDataUtils.discoverFilesToBeChangedWithMissionRepoData(
      missionMetadata,
      cachedMissionMetadata,
      briefingContent,
      cachedBriefingContent,
      taskList,
      cachedTaskList,
      isTeacherMode
    );

  const existingKeys = new Set();

  Object.keys(filenameToContentMap).forEach((key: string) => existingKeys.add(key));

  const expectedKeys = new Set([
    '.metadata',
    'README.md',
    'Q1/StarterCode.js',
    'Q1/Problem.md',
    'Q2/TestPrepend.js',
    'Q2/TestPostpend.js',
    'Q3/TestCases.json'
  ]);

  expect(existingKeys).toEqual(expectedKeys);
  expect(foldersToDelete.length).toBe(0);
});

test('discoverFilesToBeChangedWithMissionRepoData discovers files to delete', () => {
  // missionMetadata and cachedMissionMetadata have same values
  // briefingContent and cachedBriefingContent have same values
  // taskList is the shorter as cachedTaskList
  // taskList has a changed task from cachedTaskList
  // isTeacherMode is true as deletion is only accessible in isTeacherMode
  // Expect: files from Q1 to be changed, Q2 and Q3 to be deleted

  const missionMetadata = Object.assign(defaultMissionMetadata);
  const cachedMissionMetadata = Object.assign(defaultMissionMetadata);

  const briefingContent = 'dummy';
  const cachedBriefingContent = 'dummy';

  const taskList = [
    {
      questionNumber: 1,
      taskDescription: 'changed',
      starterCode: 'starter',
      savedCode: 'changed',
      testPrepend: 'changed',
      testPostpend: 'changed',
      testCases: [
        {
          answer: 'different',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const cachedTaskList = [
    {
      questionNumber: 1,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 2,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    },
    {
      questionNumber: 3,
      taskDescription: 'description',
      starterCode: 'starter',
      savedCode: 'saved',
      testPrepend: 'prepend',
      testPostpend: 'postpend',
      testCases: [
        {
          answer: '',
          program: '',
          score: 0,
          type: 'public' as const
        }
      ]
    }
  ];

  const isTeacherMode = true;

  const [filenameToContentMap, foldersToDelete] =
    GitHubMissionDataUtils.discoverFilesToBeChangedWithMissionRepoData(
      missionMetadata,
      cachedMissionMetadata,
      briefingContent,
      cachedBriefingContent,
      taskList,
      cachedTaskList,
      isTeacherMode
    );

  const existingKeys = new Set();

  Object.keys(filenameToContentMap).forEach((key: string) => existingKeys.add(key));

  const expectedKeys = new Set([
    'Q1/StarterCode.js',
    'Q1/Problem.md',
    'Q1/TestPrepend.js',
    'Q1/TestPostpend.js',
    'Q1/TestCases.json'
  ]);

  expect(existingKeys).toEqual(expectedKeys);

  expect(foldersToDelete).toEqual(['Q2', 'Q3']);
});

test('discoverFilesToBeCreatedWithoutMissionRepoData works properly', () => {
  const missionMetadata = Object.assign({}, dummyMissionMetadata);
  const briefingContent = 'dummy briefing';
  const taskData = {
    questionNumber: 0,
    taskDescription: 'description',
    starterCode: 'starter',
    savedCode: 'saved',
    testPrepend: 'prepend',
    testPostpend: 'postpend',
    testCases: [
      {
        answer: '',
        program: '',
        score: 0,
        type: 'public' as const
      }
    ]
  };

  const filenameToContentMap =
    GitHubMissionDataUtils.discoverFilesToBeCreatedWithoutMissionRepoData(
      missionMetadata,
      briefingContent,
      [taskData]
    );

  const existingKeys = new Set();

  Object.keys(filenameToContentMap).forEach((key: string) => existingKeys.add(key));

  const expectedKeys = new Set([
    'Q1/StarterCode.js',
    'Q1/Problem.md',
    '.metadata',
    'README.md',
    'Q1/TestCases.json',
    'Q1/TestPrepend.js',
    'Q1/TestPostpend.js'
  ]);

  expect(existingKeys).toEqual(expectedKeys);
});

test('checkisMCQText works properly', () => {
  expect(GitHubMissionDataUtils.checkIsMCQText('mcqddshkjf')).toBe(true);
  expect(GitHubMissionDataUtils.checkIsMCQText('McQsdlkfjsd;f')).toBe(true);
  expect(GitHubMissionDataUtils.checkIsMCQText('')).toBe(false);
  expect(GitHubMissionDataUtils.checkIsMCQText('MCgQhjkf')).toBe(false);
});

test('convertMCQTextToIMCQQuestion works properly', () => {
  const mcqText =
    'MCQ\n' +
    '{\n' +
    '  "questions":\n' +
    '  [\n' +
    '    { "solution": "Θ(1)", "hint":"one" },\n' +
    '    { "solution": "Θ(log _n_)", "hint":"two" },\n' +
    '    { "solution": "Θ(_n_)", "hint":"14345" },\n' +
    '    { "solution": "Θ(_n_ log _n_)", "hint":"yes" },\n' +
    '    { "solution": "Θ(_n_²)", "hint":"definitely wrong" },\n' +
    '    { "solution": "Θ(_n_³)", "hint":"maybe" }\n' +
    '  ],\n' +
    '  "answer": 4\n' +
    '}';

  const expectedAnswer = 4;
  const expectedChoices = [
    { content: 'Θ(1)', hint: 'one' },
    { content: 'Θ(log _n_)', hint: 'two' },
    { content: 'Θ(_n_)', hint: '14345' },
    { content: 'Θ(_n_ log _n_)', hint: 'yes' },
    { content: 'Θ(_n_²)', hint: 'definitely wrong' },
    { content: 'Θ(_n_³)', hint: 'maybe' }
  ];

  const mcqQuestionObject = GitHubMissionDataUtils.convertMCQTextToIMCQQuestion(mcqText);
  expect(mcqQuestionObject).toEqual({
    answer: expectedAnswer,
    choices: expectedChoices,
    solution: -1,
    type: 'mcq',
    content: '',
    grade: 0,
    id: 0,
    library: { chapter: 4, external: { name: 'NONE', symbols: [] }, globals: [] },
    maxGrade: 0,
    xp: 0,
    maxXp: 0
  });
});

test('convertIMCQQuestionToMCQText works properly', () => {
  const studentAnswer = 4;
  const possibleChoices = [
    { content: 'Θ(1)', hint: 'one' },
    { content: 'Θ(log _n_)', hint: 'two' },
    { content: 'Θ(_n_)', hint: '14345' },
    { content: 'Θ(_n_ log _n_)', hint: 'yes' },
    { content: 'Θ(_n_²)', hint: 'definitely wrong' },
    { content: 'Θ(_n_³)', hint: 'maybe' }
  ];

  const inputMCQObject = {
    answer: studentAnswer,
    choices: possibleChoices,
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

  const expectedText =
    'MCQ\n' +
    JSON.stringify(
      {
        questions: possibleChoices.map((choice: { content: string; hint: string }) => {
          return {
            solution: choice.content,
            hint: choice.hint
          };
        }),
        answer: studentAnswer
      },
      null,
      4
    );

  expect(GitHubMissionDataUtils.convertIMCQQuestionToMCQText(inputMCQObject)).toEqual(expectedText);
});

function generateGitHubSubDirectory(name: string) {
  return {
    type: 'dummy',
    size: 0,
    name: name,
    path: 'dummy',
    sha: 'string',
    url: 'string',
    git_url: null,
    html_url: null,
    download_url: null,
    _links: {
      self: '',
      git: null,
      html: null
    }
  };
}

function generateGetContentResponse() {
  return {
    url: '',
    status: 200 as const,
    headers: {},
    data: {
      type: 'file',
      encoding: 'base64',
      size: 0,
      name: 'name',
      path: 'path',
      content: 'pain',
      sha: '123',
      url: 'www.eh',
      git_url: null,
      html_url: null,
      download_url: null,
      _links: {
        self: '',
        git: null,
        html: null
      }
    }
  } as any;
}

const dummyMissionMetadata = {
  coverImage: 'www.eh',
  kind: 'mission',
  number: 'M2',
  title: 'Dummy',
  sourceVersion: 1,
  dueDate: new Date('December 17, 1996 03:24:00'),
  reading: 'none',
  webSummary: 'no'
};

const defaultMissionMetadata = {
  coverImage: '',
  kind: '',
  number: '',
  title: '',
  sourceVersion: 1,
  dueDate: new Date(8640000000000000),
  reading: '',
  webSummary: ''
};
