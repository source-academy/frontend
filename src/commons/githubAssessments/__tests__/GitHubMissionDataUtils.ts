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

  const savedCodeString = 'saved';
  const taskDescriptionString = 'description';

  const metadataString =
    'title=Dummy\n' +
    'coverImage=www.eh\n' +
    'webSummary=no\n' +
    'dueDate=' +
    new Date('December 17, 1996 03:24:00') +
    '\n' +
    'kind=mission\n' +
    'number=M2\n' +
    'sourceVersion=1\n' +
    'reading=none';

  const briefingString = 'dummy briefing';
  const testcasesString =
    '[\n' +
    '    {\n' +
    '        "answer": "",\n' +
    '        "program": "",\n' +
    '        "score": 0,\n' +
    '        "type": "public"\n' +
    '    }\n' +
    ']';
  const testPrependString = 'prepend';
  const testPostpendString = 'postpend';

  const expectedValue = {
    'Q1/StarterCode.js': savedCodeString,
    'Q1/Problem.md': taskDescriptionString,
    '.metadata': metadataString,
    'README.md': briefingString,
    'Q1/TestCases.json': testcasesString,
    'Q1/TestPrepend.js': testPrependString,
    'Q1/TestPostpend.js': testPostpendString
  };

  expect(filenameToContentMap).toEqual(expectedValue);
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
