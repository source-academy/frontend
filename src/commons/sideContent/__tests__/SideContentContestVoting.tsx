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
  },
  {
    submission_id: 3,
    answer: { code: 'return null' }
  }
];

const mockedHandleContestEntryClick = jest.fn();
const mockedHandleSave = jest.fn();

const mockProps = {
  handleContestEntryClick: mockedHandleContestEntryClick,
  handleSave: mockedHandleSave,
  canSave: true,
  contestEntries: mockContestEntries
};

const contestVotingContainerRender = mount(<SideContentContestVotingContainer {...mockProps} />);

// Basic snapshot testing to catch unexpected changes
test('SideContentContestVotingContainer matches snapshot', () => {
  expect(contestVotingContainerRender.debug()).toMatchSnapshot();
});

test('Tiers and entry bank are properly rendered and displayed', () => {
  const mockTiers = contestVotingContainerRender.find('div').filterWhere(x => x.hasClass('tier'));
  const mockSTier = mockTiers.get(0);
  const mockATier = mockTiers.get(1);
  const mockBTier = mockTiers.get(2);
  const mockCTier = mockTiers.get(3);
  const mockDTier = mockTiers.get(4);
  const mockBank = mockTiers.get(5);
  expect(mockSTier.props.id).toBe('tier-s');
  expect(mockATier.props.id).toBe('tier-a');
  expect(mockBTier.props.id).toBe('tier-b');
  expect(mockCTier.props.id).toBe('tier-c');
  expect(mockDTier.props.id).toBe('tier-d');
  expect(mockBank.props.id).toBe('bank');
});

test('Entries are only saved when all entries are assigned a tier', () => {
  const contestCards = contestVotingContainerRender
    .find('div')
    .filterWhere(x => x.hasClass('item'));

  const mockSWrapper = contestVotingContainerRender
    .find('div')
    .filterWhere(x => x.hasClass('tier'))
    .at(0);
  const mockSContainer = mockSWrapper.findWhere(x => x.hasClass('item-container'));

  // simulate incomplete assignment of tiers
  contestCards.at(0).simulate('dragStart', { dataTransfer: { effectAllowed: 'none' } });
  mockSContainer.simulate('drop');
  contestCards.at(0).simulate('dragEnd');
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  contestCards.at(1).simulate('dragStart', { dataTransfer: { effectAllowed: 'none' } });
  mockSContainer.simulate('drop');
  contestCards.at(1).simulate('dragEnd');
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // simulate complete assignment of tiers
  contestCards.at(2).simulate('dragStart', { dataTransfer: { effectAllowed: 'none' } });
  mockSContainer.simulate('drop');
  contestCards.at(2).simulate('dragEnd');
  expect(mockedHandleSave).toHaveBeenCalledTimes(1);
});
