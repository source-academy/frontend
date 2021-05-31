import { Octokit } from '@octokit/rest';

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
  const missionMetadata = {
    coverImage: '',
    kind: '',
    number: '',
    title: '',
    sourceVersion: 1,
    dueDate: new Date(8640000000000000),
    reading: '',
    webSummary: ''
  };
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
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Briefing Content', 'utf8').toString(
        'base64'
      );
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
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
      // folder contents
      const contentResponse = generateGetContentResponse() as {
        url: any;
        status: any;
        headers: any;
        data: any;
      };
      // Mock a folder which contains 'SavedCode.js'
      contentResponse.data = [{ name: 'SavedCode.js' }];
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      // folder contents
      const contentResponse = generateGetContentResponse() as {
        url: any;
        status: any;
        headers: any;
        data: any;
      };
      contentResponse.data = [];
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Task A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('SavedCode A', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Task B', 'utf8').toString('base64');
      return contentResponse;
    })
    .mockImplementationOnce(async () => {
      const contentResponse = generateGetContentResponse();
      (contentResponse.data as any).content = Buffer.from('Code B', 'utf8').toString('base64');
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
  expect(missionData.tasksData[0].taskDescription).toBe('Task A');
  expect(missionData.tasksData[0].starterCode).toBe('Code A');
  expect(missionData.tasksData[0].savedCode).toBe('SavedCode A');
  expect(missionData.tasksData[1].taskDescription).toBe('Task B');
  expect(missionData.tasksData[1].starterCode).toBe('Code B');
  expect(missionData.tasksData[1].savedCode).toBe('Code B');
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
