import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { shallowRender } from 'src/commons/utils/TestUtils';

import SideContentContestLeaderboard from '../content/SideContentContestLeaderboard';
import { SideContentType } from '../SideContentTypes';

const mockLeaderboardEntries = [
  {
    submission_id: 1,
    answer: { code: "display('hello world')" },
    final_score: 100,
    student_name: 'student_1'
  },
  {
    submission_id: 2,
    answer: { code: 'function test() { return 1; }' },
    final_score: 90,
    student_name: 'student_2'
  },
  {
    submission_id: 3,
    answer: { code: 'function test() { return 1; }' },
    final_score: 80,
    student_name: 'student_3'
  }
];

const mockProps = {
  handleContestEntryClick: () => {},
  orderedContestEntries: mockLeaderboardEntries,
  leaderboardType: SideContentType.scoreLeaderboard
};

// Basic snapshot testing to catch unexpected changes
test('SideContentContestLeaderboard matches snapshot', () => {
  const contestLeaderboardComponentRender = shallowRender(
    <SideContentContestLeaderboard {...mockProps} />
  );
  expect(contestLeaderboardComponentRender).toMatchSnapshot();
});

test('SideContentContestLeaderboard component renders correct number of entries.', async () => {
  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  await act(() => render(contestVotingContainer));
  expect(screen.getAllByTestId('SideContentLeaderboardCard')).toHaveLength(
    mockLeaderboardEntries.length
  );
});

// test rendering behaviour
test('SideContentContestLeaderboard orders entry in the same order as orderedContestEntries prop', async () => {
  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  await act(() => render(contestVotingContainer));
  const scores = screen.getAllByTestId('contestentry-score').map(elem => elem.textContent);
  expect(scores).toEqual(['100', '90', '80']);
});

test('Clicking the contest entry updates the editor for score leaderboard.', async () => {
  const user = userEvent.setup();
  const mockedHandleContestEntryClick = jest.fn();

  const mockProps = {
    handleContestEntryClick: mockedHandleContestEntryClick,
    orderedContestEntries: mockLeaderboardEntries,
    leaderboardType: SideContentType.scoreLeaderboard
  };

  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  await act(() => render(contestVotingContainer));
  mockedHandleContestEntryClick.mockClear();

  const cards = screen.getAllByTestId('SideContentLeaderboardCard');
  await user.click(cards[0]);
  expect(mockedHandleContestEntryClick).toBeCalledTimes(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][0]).toBe(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][1]).toBe("display('hello world')");

  await user.click(cards[1]);
  expect(mockedHandleContestEntryClick).toBeCalledTimes(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][0]).toBe(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][1]).toBe('function test() { return 1; }');
});
