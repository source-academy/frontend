import * as GitHubUtils from '../../../features/github/GitHubUtils';
import { GitHubTreeNodeCreator } from '../GitHubTreeNodeCreator';

test('Test generate first level of a repo', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const getGitHubLoginIDMock = jest.spyOn(GitHubUtils, 'getGitHubLoginID');
  getGitHubLoginIDMock.mockImplementation(getUsernameMock);

  const fileNodes = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes('some-repository');

  expect(fileNodes.length).toBe(2);
  expect(GitHubTreeNodeCreator.fileIndex).toBe(2);

  const firstElement = fileNodes[0];
  expect(firstElement.id).toBe(0);
  expect(firstElement.label).toBe('TestFile');
  expect(firstElement.nodeData.fileType).toBe('file');
  expect(firstElement.nodeData.filePath).toBe('TestFile');

  const secondElement = fileNodes[1];
  expect(secondElement.id).toBe(1);
  expect(secondElement.label).toBe('TestFolder');
  expect(secondElement.nodeData.fileType).toBe('dir');
  expect(secondElement.nodeData.filePath).toBe('TestFolder');

  getGitHubOctokitInstanceMock.mockRestore();
  getGitHubLoginIDMock.mockRestore();
});

function getOctokitInstanceMock() {
  return new Mocktokit();
}

function getUsernameMock() {
  return 'HartinMenz';
}

class Mocktokit {
  readonly repos = {
    getContent: this.getContent
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
}
