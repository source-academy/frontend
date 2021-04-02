import { mount } from 'enzyme';

import SideContentContestVotingContainer from '../SideContentContestVotingContainer';

const mockContestEntries = [
  {
    submission_id: 1,
    answer: { code: "display('hello world')" },
    score: 1
  },
  {
    submission_id: 2,
    answer: { code: 'function test() { return 1; }' },
    score: 2
  }
];

const mockProps = {
  handleContestEntryClick: () => null,
  handleSave: () => null,
  canSave: true,
  contestEntries: mockContestEntries
};

// Basic snapshot testing
test('SideContentContestVotingContainer component renders correctly for unsubmit status.', () => {
  const contestVotingContainer = <SideContentContestVotingContainer {...mockProps} />;
  const tree = mount(contestVotingContainer);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('SideContentContestEntryCard')).toHaveLength(mockContestEntries.length);

  tree.unmount();
});

const mockPropsSubmitted = {
  handleContestEntryClick: () => null,
  handleSave: () => null,
  canSave: true,
  contestEntries: [
    {
      submission_id: 1,
      answer: { code: "display('hello world')" },
      score: 1
    },
    {
      submission_id: 2,
      answer: { code: 'function test() { return 1; }' },
      score: 2
    },
    { submission_id: 3, answer: { code: '' } }
  ]
};

test('SideContentVotingContainer component renders correctly for submitted status.', () => {
  const contestVotingContainerSubmitted = (
    <SideContentContestVotingContainer {...mockPropsSubmitted} />
  );
  const tree = mount(contestVotingContainerSubmitted);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('SideContentContestEntryCard')).toHaveLength(
    mockPropsSubmitted.contestEntries.length
  );

  tree.unmount();
});
