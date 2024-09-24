import { Octokit } from '@octokit/rest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import FileExplorerDialog from '../FileExplorerDialog';
import { GitHubTreeNodeCreator } from '../GitHubTreeNodeCreator';

test('Selecting close causes onSubmit to be called with empty string', async () => {
  const octokit = getOctokitInstanceMock();

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
        editorContent={''}
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

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
      />
    );
  });

  await screen.findByText('Select a File');

  const dropdownCaret = await screen.findByText('Expand group');
  act(() => {
    fireEvent.click(dropdownCaret);
  });

  await waitFor(() => expect(screen.getAllByText('TestFolder').length).toBe(2));
});

test('Closing folder hides child files', async () => {
  const getGitHubOctokitInstanceMock = jest.spyOn(GitHubUtils, 'getGitHubOctokitInstance');
  getGitHubOctokitInstanceMock.mockImplementation(getOctokitInstanceMock);

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
      />
    );
  });

  await screen.findByText('Select a File');

  const dropdownCaret = await screen.findByText('Expand group');

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

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
      />
    );
  });

  await screen.findByText('Select a File');

  const dropdownCaret = await screen.findByText('Expand group');

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

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
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

  const performCreatingSaveMock = jest.spyOn(GitHubUtils, 'performCreatingSave');
  performCreatingSaveMock.mockImplementation(
    async (
      octokit: Octokit,
      loginID: string,
      repoName: string,
      filePath: string,
      githubName: string | null,
      githubEmail: string | null,
      commitMessage: string,
      content: string | null
    ) => {}
  );

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
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
      githubName: string | null,
      githubEmail: string | null,
      commitMessage: string,
      content: string | null
    ) => {}
  );

  const octokit = getOctokitInstanceMock();
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
        editorContent={''}
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
  };
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
