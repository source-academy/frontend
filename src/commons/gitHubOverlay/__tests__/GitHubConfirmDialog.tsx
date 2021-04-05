import { act, fireEvent, render, screen } from '@testing-library/react';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import GitHubConfirmDialog from '../GitHubConfirmDialog';

test('Test Confirm Dialog for Open', () => {
  const getPickerTypeMock = jest.spyOn(GitHubUtils, 'getPickerType');
  getPickerTypeMock.mockImplementation(returnOpen);

  const getGitHubSaveModeMock = jest.spyOn(GitHubUtils, 'getGitHubSaveMode');
  getGitHubSaveModeMock.mockImplementation(returnOverwrite);

  const confirmOpenMock = jest.fn(confirmOpen);
  const confirmCreatingSaveMock = jest.fn(confirmCreatingSave);
  const confirmOverwritingSaveMock = jest.fn(confirmOverwritingSave);
  const cancelConfirmationMock = jest.fn(cancelConfirmation);

  act(() => {
    render(
      <GitHubConfirmDialog
        isOpen={true}
        handleGitHubCancelConfirmationDialog={cancelConfirmationMock}
        handleGitHubConfirmOpen={confirmOpenMock}
        handleGitHubConfirmCreatingSave={confirmCreatingSaveMock}
        handleGitHubConfirmOverwritingSave={confirmOverwritingSaveMock}
      />
    );
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('Confirm'), leftClick);

  expect(getPickerTypeMock).toBeCalledTimes(1);
  expect(getGitHubSaveModeMock).toBeCalledTimes(1);

  expect(confirmOpenMock).toBeCalledTimes(1);
  expect(confirmCreatingSaveMock).toBeCalledTimes(0);
  expect(confirmOverwritingSaveMock).toBeCalledTimes(0);
  expect(cancelConfirmationMock).toBeCalledTimes(1);

  getPickerTypeMock.mockRestore();
  getGitHubSaveModeMock.mockRestore();
  confirmOpenMock.mockRestore();
  confirmCreatingSaveMock.mockRestore();
  confirmOverwritingSaveMock.mockRestore();
  cancelConfirmationMock.mockRestore();
});

test('Test Confirm Creating Save', () => {
  const getPickerTypeMock = jest.spyOn(GitHubUtils, 'getPickerType');
  getPickerTypeMock.mockImplementation(returnSave);

  const getGitHubSaveModeMock = jest.spyOn(GitHubUtils, 'getGitHubSaveMode');
  getGitHubSaveModeMock.mockImplementation(returnCreate);

  const confirmOpenMock = jest.fn(confirmOpen);
  const confirmCreatingSaveMock = jest.fn(confirmCreatingSave);
  const confirmOverwritingSaveMock = jest.fn(confirmOverwritingSave);
  const cancelConfirmationMock = jest.fn(cancelConfirmation);

  act(() => {
    render(
      <GitHubConfirmDialog
        isOpen={true}
        handleGitHubCancelConfirmationDialog={cancelConfirmationMock}
        handleGitHubConfirmOpen={confirmOpenMock}
        handleGitHubConfirmCreatingSave={confirmCreatingSaveMock}
        handleGitHubConfirmOverwritingSave={confirmOverwritingSaveMock}
      />
    );
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('Confirm'), leftClick);

  expect(getPickerTypeMock).toBeCalledTimes(1);
  expect(getGitHubSaveModeMock).toBeCalledTimes(1);

  expect(confirmOpenMock).toBeCalledTimes(0);
  expect(confirmCreatingSaveMock).toBeCalledTimes(1);
  expect(confirmOverwritingSaveMock).toBeCalledTimes(0);
  expect(cancelConfirmationMock).toBeCalledTimes(1);

  getPickerTypeMock.mockRestore();
  getGitHubSaveModeMock.mockRestore();
  confirmOpenMock.mockRestore();
  confirmCreatingSaveMock.mockRestore();
  confirmOverwritingSaveMock.mockRestore();
  cancelConfirmationMock.mockRestore();
});

test('Test Confirm Overwriting Save', () => {
  const getPickerTypeMock = jest.spyOn(GitHubUtils, 'getPickerType');
  getPickerTypeMock.mockImplementation(returnSave);

  const getGitHubSaveModeMock = jest.spyOn(GitHubUtils, 'getGitHubSaveMode');
  getGitHubSaveModeMock.mockImplementation(returnOverwrite);

  const confirmOpenMock = jest.fn(confirmOpen);
  const confirmCreatingSaveMock = jest.fn(confirmCreatingSave);
  const confirmOverwritingSaveMock = jest.fn(confirmOverwritingSave);
  const cancelConfirmationMock = jest.fn(cancelConfirmation);

  act(() => {
    render(
      <GitHubConfirmDialog
        isOpen={true}
        handleGitHubCancelConfirmationDialog={cancelConfirmationMock}
        handleGitHubConfirmOpen={confirmOpenMock}
        handleGitHubConfirmCreatingSave={confirmCreatingSaveMock}
        handleGitHubConfirmOverwritingSave={confirmOverwritingSaveMock}
      />
    );
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('Confirm'), leftClick);

  expect(getPickerTypeMock).toBeCalledTimes(1);
  expect(getGitHubSaveModeMock).toBeCalledTimes(1);

  expect(confirmOpenMock).toBeCalledTimes(0);
  expect(confirmCreatingSaveMock).toBeCalledTimes(0);
  expect(confirmOverwritingSaveMock).toBeCalledTimes(1);
  expect(cancelConfirmationMock).toBeCalledTimes(1);

  getPickerTypeMock.mockRestore();
  getGitHubSaveModeMock.mockRestore();
  confirmOpenMock.mockRestore();
  confirmCreatingSaveMock.mockRestore();
  confirmOverwritingSaveMock.mockRestore();
  cancelConfirmationMock.mockRestore();
});

test('Test cancel dialog', () => {
  const getPickerTypeMock = jest.spyOn(GitHubUtils, 'getPickerType');
  getPickerTypeMock.mockImplementation(returnSave);

  const getGitHubSaveModeMock = jest.spyOn(GitHubUtils, 'getGitHubSaveMode');
  getGitHubSaveModeMock.mockImplementation(returnOverwrite);

  const confirmOpenMock = jest.fn(confirmOpen);
  const confirmCreatingSaveMock = jest.fn(confirmCreatingSave);
  const confirmOverwritingSaveMock = jest.fn(confirmOverwritingSave);
  const cancelConfirmationMock = jest.fn(cancelConfirmation);

  act(() => {
    render(
      <GitHubConfirmDialog
        isOpen={true}
        handleGitHubCancelConfirmationDialog={cancelConfirmationMock}
        handleGitHubConfirmOpen={confirmOpenMock}
        handleGitHubConfirmCreatingSave={confirmCreatingSaveMock}
        handleGitHubConfirmOverwritingSave={confirmOverwritingSaveMock}
      />
    );
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('Cancel'), leftClick);

  expect(getPickerTypeMock).toBeCalledTimes(1);
  expect(getGitHubSaveModeMock).toBeCalledTimes(1);

  expect(confirmOpenMock).toBeCalledTimes(0);
  expect(confirmCreatingSaveMock).toBeCalledTimes(0);
  expect(confirmOverwritingSaveMock).toBeCalledTimes(0);
  expect(cancelConfirmationMock).toBeCalledTimes(1);

  getPickerTypeMock.mockRestore();
  getGitHubSaveModeMock.mockRestore();
  confirmOpenMock.mockRestore();
  confirmCreatingSaveMock.mockRestore();
  confirmOverwritingSaveMock.mockRestore();
  cancelConfirmationMock.mockRestore();
});

function cancelConfirmation(): void {}

function confirmOpen(): void {}

function confirmCreatingSave(): void {}

function confirmOverwritingSave(): void {}

function returnOpen(): string {
  return 'Open';
}

function returnSave(): string {
  return 'Save';
}

function returnOverwrite(): string {
  return 'Overwrite';
}

function returnCreate(): string {
  return 'Create';
}
