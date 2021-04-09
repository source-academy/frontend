import { act, fireEvent, render, screen } from '@testing-library/react';

import RepositoryDialog from '../RepositoryDialog';

test('Submitting without selecting causes error message to be displayed', async () => {
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

  await screen.findByText('No repository selected!');
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
