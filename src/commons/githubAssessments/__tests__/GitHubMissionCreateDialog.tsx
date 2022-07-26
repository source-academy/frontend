import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  GitHubMissionCreateDialog,
  GitHubMissionCreateDialogResolution
} from '../GitHubMissionCreateDialog';

test("Selecting close causes ResolveDialog to be called with confirmSave=true and repoName=''", async () => {
  let outsideValue = {
    confirmSave: false,
    repoName: 'test'
  } as GitHubMissionCreateDialogResolution;
  function resolveDialog(insideValue: GitHubMissionCreateDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionCreateDialog
        filesToCreate={[]}
        userLogin={'UsadaPekora'}
        resolveDialog={resolveDialog}
      />
    );
  });

  await screen.findByText('Please confirm your save');

  fireEvent.click(screen.getByText('Close'));
  expect(outsideValue).toStrictEqual({ confirmSave: false, repoName: '' });
});

test('Selecting Confirm without repository name does not result in dialog resolution', async () => {
  let outsideValue = {
    confirmSave: false,
    repoName: 'test'
  } as GitHubMissionCreateDialogResolution;
  function resolveDialog(insideValue: GitHubMissionCreateDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionCreateDialog
        filesToCreate={[]}
        userLogin={'UsadaPekora'}
        resolveDialog={resolveDialog}
      />
    );
  });

  await screen.findByText('Please confirm your save');
  const textArea = screen.getByPlaceholderText('Enter Repository Title');
  userEvent.clear(textArea);
  fireEvent.click(screen.getByText('Confirm'));
  expect(outsideValue).toStrictEqual({ confirmSave: false, repoName: 'test' });
});

test('Selecting Confirm with repository name causes ResolveDialog to be called with confirmSave=true and inputted repoName', async () => {
  let outsideValue = {
    confirmSave: false,
    repoName: 'blank'
  } as GitHubMissionCreateDialogResolution;
  function resolveDialog(insideValue: GitHubMissionCreateDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionCreateDialog
        filesToCreate={[]}
        userLogin={'UsadaPekora'}
        resolveDialog={resolveDialog}
      />
    );
  });

  await screen.findByText('Please confirm your save');
  const textArea = screen.getByPlaceholderText('Enter Repository Title');
  await userEvent.clear(textArea);
  await userEvent.type(textArea, 'repoName');
  fireEvent.click(screen.getByText('Confirm'));
  expect(outsideValue).toStrictEqual({ confirmSave: true, repoName: 'repoName' });
});
