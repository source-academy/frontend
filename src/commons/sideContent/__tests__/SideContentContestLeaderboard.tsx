import { Card, Pre } from '@blueprintjs/core';
import { mount } from 'enzyme';

import SideContentContestLeaderboard from '../SideContentContestLeaderboard';
import SideContentLeaderboardCard from '../SideContentLeaderboardCard';

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
  orderedContestEntries: mockLeaderboardEntries
};

// Basic snapshot testing to catch unexpected changes
test('SideContentContestLeaderboard matches snapshot', () => {
  const contestLeaderboardComponentRender = mount(<SideContentContestLeaderboard {...mockProps} />);

  expect(contestLeaderboardComponentRender.debug()).toMatchSnapshot();
});

test('SideContentContestLeaderboard component renders correct number of entries.', () => {
  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  const SideContentContestLeaderboardRender = mount(contestVotingContainer);

  expect(SideContentContestLeaderboardRender.find('SideContentLeaderboardCard')).toHaveLength(
    mockLeaderboardEntries.length
  );

  SideContentContestLeaderboardRender.setProps({
    contestEntries: [
      ...mockLeaderboardEntries,
      { submission_id: 4, answer: { code: '' }, score: 70, student_name: 'student_4' }
    ]
  });

  expect(SideContentContestLeaderboardRender.find('SideContentLeaderboardCard')).toHaveLength(
    mockLeaderboardEntries.length
  );
});

// test rendering behaviour
test('SideContentContestLeaderboard orders entry in the same order as orderedContestEntries prop', () => {
  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  const SideContentContestLeaderboardRender = mount(contestVotingContainer);

  expect(SideContentContestLeaderboardRender.find(Card).at(0).find(Pre).at(2).text()).toBe('100');

  expect(SideContentContestLeaderboardRender.find(Card).at(1).find(Pre).at(2).text()).toBe('90');

  expect(SideContentContestLeaderboardRender.find(Card).at(2).find(Pre).at(2).text()).toBe('80');
});

test('Clicking the contest entry updates the editor for contest leaderboard.', () => {
  const mockedHandleContestEntryClick = jest.fn();

  const mockProps = {
    handleContestEntryClick: mockedHandleContestEntryClick,
    orderedContestEntries: mockLeaderboardEntries
  };

  const contestVotingContainer = <SideContentContestLeaderboard {...mockProps} />;
  const contestVotingContainerRender = mount(contestVotingContainer);

  mockedHandleContestEntryClick.mockClear();
  contestVotingContainerRender.find(SideContentLeaderboardCard).find(Card).at(0).simulate('click');
  expect(mockedHandleContestEntryClick).toBeCalledTimes(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][0]).toBe(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][1]).toBe("display('hello world')");

  contestVotingContainerRender.find(SideContentLeaderboardCard).find(Card).at(1).simulate('click');
  expect(mockedHandleContestEntryClick).toBeCalledTimes(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][0]).toBe(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][1]).toBe('function test() { return 1; }');
});
