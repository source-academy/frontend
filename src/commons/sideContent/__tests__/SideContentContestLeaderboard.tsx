import { Card, Pre } from '@blueprintjs/core';
import { mount } from 'enzyme';

import SideContentContestLeaderboard from '../SideContentContestLeaderboard';

const mockLeaderboardEntries = [
  {
    submission_id: 1,
    answer: { code: "display('hello world')" },
    score: 100,
    student_name: 'student_1'
  },
  {
    submission_id: 2,
    answer: { code: 'function test() { return 1; }' },
    score: 90,
    student_name: 'student_2'
  },
  {
    submission_id: 3,
    answer: { code: 'function test() { return 1; }' },
    score: 80,
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
