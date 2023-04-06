import { mount } from 'enzyme';

import SideContentContestVotingContainer from '../SideContentContestVotingContainer';

const mockContestEntries = [
  {
    submission_id: 1,
    answer: { code: "display('hello world')" }
  },
  {
    submission_id: 2,
    answer: { code: 'function test() { return 1; }' }
  }
];

const mockProps = {
  handleContestEntryClick: () => {},
  handleSave: () => {},
  canSave: true,
  contestEntries: mockContestEntries
};

// Basic snapshot testing to catch unexpected changes
test('SideContentContestVotingContainer matches snapshot', () => {
  const contestVotingComponentRender = mount(<SideContentContestVotingContainer {...mockProps} />);

  expect(contestVotingComponentRender.debug()).toMatchSnapshot();
});
