import { Octokit } from '@octokit/rest';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import { GitHubTreeNodeCreator } from '../GitHubTreeNodeCreator';

test('Test generate first level of a repo', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const fileNodes = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes('some-repository');

  expect(fileNodes.length).toBe(2);
  expect(GitHubTreeNodeCreator.fileIndex).toBe(2);

  const firstElement = fileNodes[0];
  expect(firstElement.id).toBe(0);
  expect(firstElement.label).toBe('TestFile');
  expect(firstElement.nodeData).toBeDefined();
  if (firstElement.nodeData !== undefined) {
    expect(firstElement.nodeData.fileType).toBe('file');
    expect(firstElement.nodeData.filePath).toBe('TestFile');
  }

  const secondElement = fileNodes[1];
  expect(secondElement.id).toBe(1);
  expect(secondElement.label).toBe('TestFolder');
  if (secondElement.nodeData !== undefined) {
    expect(secondElement.nodeData.fileType).toBe('dir');
    expect(secondElement.nodeData.filePath).toBe('TestFolder');
  }

  getGitHubOctokitInstanceMock.mockRestore();

  GitHubTreeNodeCreator.fileIndex = 0;
  GitHubTreeNodeCreator.currentRepoName = '';
});

test('Test attempt to generate repo with repoName as empty string', async () => {
  const fileNodes = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes('');

  expect(fileNodes.length).toBe(0);
  expect(GitHubTreeNodeCreator.fileIndex).toBe(0);

  GitHubTreeNodeCreator.fileIndex = 0;
  GitHubTreeNodeCreator.currentRepoName = '';
});

test('Test attempt to create child nodes from two different repositories', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const fileNodes = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes('some-repository');
  const secondFileNodes = await GitHubTreeNodeCreator.getChildNodes('another-repository', '');

  expect(fileNodes.length).toBe(2);
  expect(GitHubTreeNodeCreator.fileIndex).toBe(2);

  const firstElement = fileNodes[0];
  expect(firstElement.id).toBe(0);
  expect(firstElement.label).toBe('TestFile');
  if (firstElement.nodeData !== undefined) {
    expect(firstElement.nodeData.fileType).toBe('file');
    expect(firstElement.nodeData.filePath).toBe('TestFile');
  }

  const secondElement = fileNodes[1];
  expect(secondElement.id).toBe(1);
  expect(secondElement.label).toBe('TestFolder');
  if (secondElement.nodeData?.filePath !== undefined) {
    expect(secondElement.nodeData.fileType).toBe('dir');
    expect(secondElement.nodeData.filePath).toBe('TestFolder');
  }

  expect(secondFileNodes.length).toBe(0);

  getGitHubOctokitInstanceMock.mockRestore();

  GitHubTreeNodeCreator.fileIndex = 0;
  GitHubTreeNodeCreator.currentRepoName = '';
});

test('Test attempt to create repository while octokit not yet set', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceReturnUndefined);

  const fileNodes = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes('some-repository');

  expect(fileNodes.length).toBe(0);
  expect(GitHubTreeNodeCreator.fileIndex).toBe(0);

  getGitHubOctokitInstanceMock.mockRestore();

  GitHubTreeNodeCreator.fileIndex = 0;
  GitHubTreeNodeCreator.currentRepoName = '';
});

function getOctokitInstanceReturnUndefined() {
  return undefined;
}

function getOctokitInstanceMock() {
  const octokit = new Octokit();

  const getContentMock = jest.spyOn(octokit.repos, 'getContent');
  getContentMock.mockImplementation(async () => {
    const contentResponse = generateGetContentResponse();
    contentResponse.data = [
      generateGitHubSubDirectory('TestFile', 'file', 'TestFile'),
      generateGitHubSubDirectory('TestFolder', 'dir', 'TestFolder')
    ];
    return contentResponse;
  });

  const getAuthenticatedMock = jest.spyOn(octokit.users, 'getAuthenticated');
  getAuthenticatedMock.mockImplementation(async () => {
    const authResponse = generateGetAuthenticatedResponse();
    return authResponse;
  });

  return octokit;
}

function generateGetContentResponse() {
  return {
    url: '',
    status: 200,
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

function generateGitHubSubDirectory(name: string, type: string, path: string) {
  return {
    type: type,
    size: 0,
    name: name,
    path: path,
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
  } as any;
}

function generateGetAuthenticatedResponse() {
  return {
    data: {
      avatar_url: 'dummy',
      bio: null,
      blog: null,
      company: null,
      created_at: 'dummy',
      email: null,
      events_url: 'dummy',
      followers: 0,
      followers_url: 'dummy',
      following: 0,
      following_url: 'dummy',
      gists_url: 'dummy',
      gravatar_id: null,
      hireable: null,
      html_url: 'dummy',
      id: 0,
      location: null,
      login: 'dummyUserName',
      name: null,
      node_id: 'dummy',
      organizations_url: 'dummy',
      public_gists: 0,
      public_repos: 0,
      received_events_url: 'dummy',
      repos_url: 'dummy',
      site_admin: false,
      starred_url: 'dummy',
      subscriptions_url: 'dummy',
      type: 'dummy',
      updated_at: 'dummy',
      url: 'dummy'
    },
    headers: {},
    status: 200,
    url: 'www.eh'
  } as any;
}
