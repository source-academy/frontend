import { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import { DeepPartial } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedFunction } from 'jest-mock';
import { act } from 'react';

import {
  checkIfFileCanBeOpened,
  checkIfFileCanBeSavedAndGetSaveType,
  checkIfUserAgreesToOverwriteEditorData,
  checkIfUserAgreesToPerformOverwritingSave,
  getGitHubOctokitInstance,
  openFileInEditor,
  performCreatingSave,
  performOverwritingSave
} from '../../../features/github/GitHubUtils';
import FileExplorerDialog from '../FileExplorerDialog';
import { GitHubTreeNodeCreator } from '../GitHubTreeNodeCreator';

jest.mock('../../../features/github/GitHubUtils');

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
  const getGitHubOctokitInstanceMock = getGitHubOctokitInstance as MockedFunction<
    typeof getGitHubOctokitInstance
  >;
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
  const getGitHubOctokitInstanceMock = getGitHubOctokitInstance as MockedFunction<
    typeof getGitHubOctokitInstance
  >;
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
  const getGitHubOctokitInstanceMock = getGitHubOctokitInstance as MockedFunction<
    typeof getGitHubOctokitInstance
  >;
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
  const checkIfFileCanBeOpenedMock = checkIfFileCanBeOpened as MockedFunction<
    typeof checkIfFileCanBeOpened
  >;
  checkIfFileCanBeOpenedMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => true
  );

  const checkIfUserAgreesToOverwriteEditorDataMock =
    checkIfUserAgreesToOverwriteEditorData as MockedFunction<
      typeof checkIfUserAgreesToOverwriteEditorData
    >;
  checkIfUserAgreesToOverwriteEditorDataMock.mockImplementation(async () => true);

  const openFileInEditorMock = openFileInEditor as MockedFunction<typeof openFileInEditor>;
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
  const checkIfFileCanBeSavedAndGetSaveTypeMock =
    checkIfFileCanBeSavedAndGetSaveType as MockedFunction<
      typeof checkIfFileCanBeSavedAndGetSaveType
    >;

  checkIfFileCanBeSavedAndGetSaveTypeMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => {
      return { canBeSaved: true, saveType: 'Create' };
    }
  );

  const performCreatingSaveMock = performCreatingSave as MockedFunction<typeof performCreatingSave>;
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
  const checkIfFileCanBeSavedAndGetSaveTypeMock =
    checkIfFileCanBeSavedAndGetSaveType as MockedFunction<
      typeof checkIfFileCanBeSavedAndGetSaveType
    >;

  checkIfFileCanBeSavedAndGetSaveTypeMock.mockImplementation(
    async (octokit: Octokit, loginID: string, repoName: string, filePath: string) => {
      return { canBeSaved: true, saveType: 'Overwrite' };
    }
  );

  const checkIfUserAgreesToPerformOverwritingSaveMock =
    checkIfUserAgreesToPerformOverwritingSave as MockedFunction<
      typeof checkIfUserAgreesToPerformOverwritingSave
    >;
  checkIfUserAgreesToPerformOverwritingSaveMock.mockImplementation(async () => true);

  const performOverwritingSaveMock = performOverwritingSave as MockedFunction<
    typeof performOverwritingSave
  >;
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
  return {
    repos: {
      getContent: jest.fn().mockImplementation(async () => {
        const contentResponse = generateGetContentResponse();
        contentResponse.data = [
          generateGitHubSubDirectory('TestFile', 'file', 'TestFile'),
          generateGitHubSubDirectory('TestFolder', 'dir', 'TestFolder')
          // TODO: Remove any
        ] as any;
        return contentResponse;
      }) as any
    },
    users: {
      getAuthenticated: jest.fn().mockResolvedValue(generateGetAuthenticatedResponse()) as any
    }
  } satisfies DeepPartial<Octokit> as Octokit;
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
  } satisfies GetResponseTypeFromEndpointMethod<Octokit['repos']['getContent']>;
}

function generateGitHubSubDirectory(name: string, type: 'file' | 'dir', path: string) {
  return {
    type: type as 'file', // TODO: Fix
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
    // TODO: Remove partial
  } satisfies Partial<GetResponseTypeFromEndpointMethod<Octokit['repos']['getContent']>['data']>;
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
  } satisfies GetResponseTypeFromEndpointMethod<Octokit['users']['getAuthenticated']>;
}
