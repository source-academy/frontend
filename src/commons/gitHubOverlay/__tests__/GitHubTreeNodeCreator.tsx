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

function getOctokitInstanceMock() {
  return new Mocktokit();
}

function getOctokitInstanceReturnUndefined() {
  return undefined;
}

class Mocktokit {
  readonly repos = {
    getContent: this.getContent
  };

  readonly users = {
    getAuthenticated: this.getAuthenticated
  };

  async getContent(dummyObject: any) {
    const childFileArray = [
      {
        name: 'TestFile',
        type: 'file',
        path: 'TestFile'
      },
      {
        name: 'TestFolder',
        type: 'dir',
        path: 'TestFolder'
      }
    ];

    return {
      data: childFileArray
    };
  }

  async getAuthenticated() {
    return {
      data: {
        login: 'dummyUserName'
      }
    };
  }
}
