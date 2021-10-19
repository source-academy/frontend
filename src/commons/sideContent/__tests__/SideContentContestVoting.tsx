import { NumericInput } from '@blueprintjs/core';
import { Card } from '@blueprintjs/core';
import { mount } from 'enzyme';

import SideContentContestEntryCard from '../SideContentContestEntryCard';
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

test('SideContentVotingContainer disabled once canSave == false', () => {
  const mockProps = {
    handleContestEntryClick: () => {},
    handleSave: () => {},
    canSave: false,
    contestEntries: mockContestEntries
  };

  const contestVotingComponentRender = mount(<SideContentContestVotingContainer {...mockProps} />);
  const contestVotingCards = contestVotingComponentRender.find(NumericInput);
  contestVotingCards.map(card => expect(card.prop('disabled')).toBe(true));
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
  contestVotingCard.map(card => card.simulate('change', { target: { value: 10 } }));
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // to avoid warning messages from blueprint.js due to testing invalid input during tests
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  // simulate change to exceed score limit (ie. if 2 entries can only rank [9, 10])
  contestVotingCard.map(card => card.simulate('change', { target: { value: 11 } }));
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // simulate appropriate ranking for entries
  contestVotingCard.map((card, index) =>
    card.simulate('change', { target: { value: 10 - index } })
  );
  expect(mockedHandleSave).toHaveBeenCalledTimes(1);

  consoleWarnSpy.mockRestore();
});

test('Clicking the contest entry updates the editor for contest voting.', () => {
  const mockedHandleContestEntryClick = jest.fn();

  const mockProps = {
    handleContestEntryClick: mockedHandleContestEntryClick,
    handleSave: () => {},
    canSave: true,
    contestEntries: mockContestEntries
  };

  const contestVotingContainer = <SideContentContestVotingContainer {...mockProps} />;
  const contestVotingContainerRender = mount(contestVotingContainer);

  mockedHandleContestEntryClick.mockClear();
  contestVotingContainerRender.find(SideContentContestEntryCard).find(Card).at(0).simulate('click');
  expect(mockedHandleContestEntryClick).toBeCalledTimes(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][0]).toBe(1);
  expect(mockedHandleContestEntryClick.mock.calls[0][1]).toBe("display('hello world')");

  contestVotingContainerRender.find(SideContentContestEntryCard).find(Card).at(1).simulate('click');
  expect(mockedHandleContestEntryClick).toBeCalledTimes(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][0]).toBe(2);
  expect(mockedHandleContestEntryClick.mock.calls[1][1]).toBe('function test() { return 1; }');
});
