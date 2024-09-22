import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';

import * as NotificationHelper from '../../utils/notifications/NotificationsHelper';
import RepositoryDialog from '../RepositoryDialog';

test('Submitting without selecting causes error message to be displayed', async () => {
  const notificationMock = jest.spyOn(NotificationHelper, 'showWarningMessage');
  function onSubmit(inputValue: string) {}

  const userRepos = [
    { name: 'firstRepo', id: 1 },
    { name: 'secondRepo', id: 2 },
    { name: 'thirdRepo', id: 3 }
  ];

  act(() => {
    render(<RepositoryDialog onSubmit={onSubmit} userRepos={userRepos} />);
  });

  fireEvent.click(screen.getByText('Select'));

  expect(notificationMock).toBeCalledTimes(1);
});

test('Selection sets repoName for submission', () => {
  let setValue = '';

  function onSubmit(inputValue: string) {
    setValue = inputValue;
  }

  const userRepos = [
    { name: 'firstRepo', id: 1 },
    { name: 'secondRepo', id: 2 },
    { name: 'thirdRepo', id: 3 }
  ];

  act(() => {
    render(<RepositoryDialog onSubmit={onSubmit} userRepos={userRepos} />);
  });

  fireEvent.click(screen.getByText('firstRepo'));
  fireEvent.click(screen.getByText('Select'));

  expect(setValue).toBe('firstRepo');
});

test('Closing dialog causes onSubmit to be called with empty string', () => {
  let setValue = 'non-empty string';

  function onSubmit(inputValue: string) {
    setValue = inputValue;
  }

  const userRepos = [
    { name: 'firstRepo', id: 1 },
    { name: 'secondRepo', id: 2 },
    { name: 'thirdRepo', id: 3 }
  ];

  act(() => {
    render(<RepositoryDialog onSubmit={onSubmit} userRepos={userRepos} />);
  });

  fireEvent.click(screen.getByText('Close'));

  expect(setValue).toBe('');
});
