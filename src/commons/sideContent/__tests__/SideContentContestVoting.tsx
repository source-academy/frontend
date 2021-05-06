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

test('SideContentContestVotingContainer component renders correct number of entries.', () => {
  const contestVotingContainer = <SideContentContestVotingContainer {...mockProps} />;
  const contestVotingContainerRender = mount(contestVotingContainer);

  expect(contestVotingContainerRender.find('SideContentContestEntryCard')).toHaveLength(
    mockContestEntries.length
  );

  contestVotingContainerRender.setProps({
    contestEntries: [...mockContestEntries, { submission_id: 3, answer: { code: '' } }]
  });

  expect(contestVotingContainerRender.find('SideContentContestEntryCard')).toHaveLength(
    mockContestEntries.length
  );
});

// testing the ranking validation logic
test('SideContentVotingContainer only updates when ranks assigned to entries are unique and within rank limit.', () => {
  const mockedHandleContestEntryClick = jest.fn();
  const mockedHandleSave = jest.fn();

  const mockProps = {
    handleContestEntryClick: mockedHandleContestEntryClick,
    handleSave: mockedHandleSave,
    canSave: true,
    contestEntries: mockContestEntries
  };

  const contestVotingContainer = <SideContentContestVotingContainer {...mockProps} />;
  const contestVotingContainerRender = mount(contestVotingContainer);

  const contestVotingCard = contestVotingContainerRender.find('input');

  // simulate change to duplicate
  contestVotingCard.map(card => card.simulate('change', { target: { value: 1 } }));
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // simulate change to exceed rank limit (ie. if 2 entries can only rank [1, 2])
  contestVotingCard.map(card => card.simulate('change', { target: { value: 3 } }));
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // simulate appropriate ranking for entries
  contestVotingCard.map((card, index) => card.simulate('change', { target: { value: index + 1 } }));
  expect(mockedHandleSave).toHaveBeenCalledTimes(1);
});
