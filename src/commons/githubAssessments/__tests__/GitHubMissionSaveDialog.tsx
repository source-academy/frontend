import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  GitHubMissionSaveDialog,
  GitHubMissionSaveDialogResolution
} from '../GitHubMissionSaveDialog';

test('Selecting close causes resolveDialog to be called with false confirmSave and empty string commitMessage', async () => {
  const repoName = 'dummy value';
  const changedFiles: string[] = [];
  const filesToDelete: string[] = [];
  let outsideValue = { confirmSave: true, commitMessage: 'a-commit-message' };
  function resolveDialog(insideValue: GitHubMissionSaveDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionSaveDialog
        repoName={repoName}
        filesToChangeOrCreate={changedFiles}
        filesToDelete={filesToDelete}
        resolveDialog={resolveDialog}
      />
    );
  });

  await screen.findByText('Please confirm your save');

  fireEvent.click(screen.getByText('Close'));
  expect(outsideValue).toStrictEqual({ confirmSave: false, commitMessage: '' });
});

test('Selecting save causes resolveDialog to be called with true confirmSave and empty string commitMessage', async () => {
  const repoName = 'dummy value';
  const changedFiles: string[] = [];
  const filesToDelete: string[] = [];
  let outsideValue = { confirmSave: false, commitMessage: 'not-a-commit-message' };
  function resolveDialog(insideValue: GitHubMissionSaveDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionSaveDialog
        repoName={repoName}
        filesToChangeOrCreate={changedFiles}
        filesToDelete={filesToDelete}
        resolveDialog={resolveDialog}
      />
    );
  });

  await screen.findByText('Please confirm your save');

  fireEvent.click(screen.getByText('Confirm'));
  expect(outsideValue).toStrictEqual({ confirmSave: true, commitMessage: '' });
});

test('Selecting Confirm causes resolveDialog to be called with confirmSave = true and commitMessage = InputGroup value', async () => {
  const repoName = 'dummy value';
  const changedFiles: string[] = ['Q1/StarterCode.js'];
  const filesToDelete: string[] = ['Q2'];
  let outsideValue = { confirmSave: false, commitMessage: 'not-a-commit-message' };
  function resolveDialog(insideValue: GitHubMissionSaveDialogResolution) {
    outsideValue = insideValue;
  }

  act(() => {
    render(
      <GitHubMissionSaveDialog
        repoName={repoName}
        filesToChangeOrCreate={changedFiles}
        filesToDelete={filesToDelete}
        resolveDialog={resolveDialog}
      />
    );
  });

  await waitFor(() => expect(screen.getAllByText('Q1/StarterCode.js').length).toBe(1));
  await waitFor(() => expect(screen.getAllByText('Q2').length).toBe(1));
  await screen.findByText('Please confirm your save');
  await userEvent.type(screen.getByPlaceholderText('Enter Commit Message'), 'message');
  fireEvent.click(screen.getByText('Confirm'));
  expect(outsideValue).toStrictEqual({ confirmSave: true, commitMessage: 'message' });
});
