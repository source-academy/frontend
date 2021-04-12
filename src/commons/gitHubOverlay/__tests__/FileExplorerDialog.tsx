import { Octokit } from '@octokit/rest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import FileExplorerDialog from '../FileExplorerDialog';
import { GitHubTreeNodeCreator } from '../GitHubTreeNodeCreator';

test('Selecting close causes onSubmit to be called with empty string', async () => {
  const octokit = new Mocktokit();

  let outsideValue = 'non-empty';
  function onSubmit(insideValue: string) {
    outsideValue = insideValue;
  }

  const pickerType = 'Open';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  fireEvent.click(screen.getByText('Close'));
  expect(outsideValue).toBe('');
});

test('Opening folder for first time causes child files to be loaded', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Open';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  act(() => {
    fireEvent.click(screen.getByText('chevron-right'));
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(2));
});

test('Closing folder hides child files', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Open';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  const dropdownCaret = screen.getByText('chevron-right');

  // Open the folder for the first time, now there should be 2 TestFolders
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(2));

  // Close the folder, now children should be hidden
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(1));
});

test('Opening folder for second time does not cause child files to be loaded', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const getChildNodesSpy = jest.spyOn(GitHubTreeNodeCreator, 'getChildNodes');

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Open';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  const dropdownCaret = screen.getByText('chevron-right');

  // Open the folder, there should be 2 TestFolders in the render
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(2));

  // Close the folder, only the parent folder is present
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(1));

  // Open the folder again, now both parent and child are rendered
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(2));

  // The first call generates the first level of the repository
  // The second call generates the immediate children of the TestFolder
  // There should not be a third call on re-rendering the child nodes
  expect(getChildNodesSpy).toBeCalledTimes(2);
});

test('Opening folder in editor leads to appropriate function being called', async () => {
  const checkIfFileCanBeOpenedMock = jest.spyOn(GitHubUtils, 'checkIfFileCanBeOpened');
  checkIfFileCanBeOpenedMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => true
  );

  const checkIfUserAgreesToOverwriteEditorDataMock = jest.spyOn(
    GitHubUtils,
    'checkIfUserAgreesToOverwriteEditorData'
  );
  checkIfUserAgreesToOverwriteEditorDataMock.mockImplementation(async () => true);

  const openFileInEditorMock = jest.spyOn(GitHubUtils, 'openFileInEditor');
  openFileInEditorMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => {}
  );

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Open';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  fireEvent.click(screen.getByText('Open'));

  await waitFor(() => expect(openFileInEditorMock).toBeCalledTimes(1));
});

test('Performing creating save leads to appropriate function being called', async () => {
  const checkIfFileCanBeSavedAndGetSaveTypeMock = jest.spyOn(
    GitHubUtils,
    'checkIfFileCanBeSavedAndGetSaveType'
  );

  checkIfFileCanBeSavedAndGetSaveTypeMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => {
      return { canBeSaved: true, saveType: 'Create' };
    }
  );

  const checkIfUserAgreesToPerformCreatingSaveMock = jest.spyOn(
    GitHubUtils,
    'checkIfUserAgreesToPerformCreatingSave'
  );
  checkIfUserAgreesToPerformCreatingSaveMock.mockImplementation(async () => true);

  const performCreatingSaveMock = jest.spyOn(GitHubUtils, 'performCreatingSave');
  performCreatingSaveMock.mockImplementation(
    async (
      octokit: Octokit,
      loginID: string,
      repoName: string,
      filePath: string,
      githubName: string,
      githubEmail: string,
      commitMessage: string
    ) => {}
  );

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Save';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  act(() => {
    fireEvent.click(screen.getByText('Save'));
  });

  await waitFor(() => expect(performCreatingSaveMock).toBeCalledTimes(1));
});

test('Performing ovewriting save leads to appropriate function being called', async () => {
  const checkIfFileCanBeSavedAndGetSaveTypeMock = jest.spyOn(
    GitHubUtils,
    'checkIfFileCanBeSavedAndGetSaveType'
  );

  checkIfFileCanBeSavedAndGetSaveTypeMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => {
      return { canBeSaved: true, saveType: 'Overwrite' };
    }
  );

  const checkIfUserAgreesToPerformOverwritingSaveMock = jest.spyOn(
    GitHubUtils,
    'checkIfUserAgreesToPerformOverwritingSave'
  );
  checkIfUserAgreesToPerformOverwritingSaveMock.mockImplementation(async () => true);

  const performOverwritingSaveMock = jest.spyOn(GitHubUtils, 'performOverwritingSave');
  performOverwritingSaveMock.mockImplementation(
    async (
      octokit: Octokit,
      loginID: string,
      repoName: string,
      filePath: string,
      githubName: string,
      githubEmail: string,
      commitMessage: string
    ) => {}
  );

  const octokit = new Mocktokit();
  function onSubmit(insideValue: string) {}
  const pickerType = 'Save';
  const repoName = 'dummy value';

  act(() => {
    render(
      <FileExplorerDialog
        octokit={octokit}
        onSubmit={onSubmit}
        pickerType={pickerType}
        repoName={repoName}
      />
    );
  });

  await screen.findByText('Select a File');

  act(() => {
    fireEvent.click(screen.getByText('Save'));
  });

  await waitFor(() => expect(performOverwritingSaveMock).toBeCalledTimes(1));
});

function getOctokitInstanceMock() {
  return new Mocktokit();
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
