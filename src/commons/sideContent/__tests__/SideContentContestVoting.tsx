import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import SideContentContestVotingContainer from '../content/SideContentContestVotingContainer';

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

const element = <SideContentContestVotingContainer {...mockProps} />;

// Basic snapshot testing to catch unexpected changes
test('SideContentContestVotingContainer matches snapshot', async () => {
  const tree = await renderTreeJson(element);
  expect(tree).toMatchSnapshot();
});

test('Tiers and entry bank are properly rendered and displayed', async () => {
  await act(() => render(element));

  const mockTiers = screen.getAllByTestId('tier');
  const [mockSTier, mockATier, mockBTier, mockCTier, mockDTier, mockBank] = mockTiers;

  expect(mockSTier.id).toBe('tier-s');
  expect(mockATier.id).toBe('tier-a');
  expect(mockBTier.id).toBe('tier-b');
  expect(mockCTier.id).toBe('tier-c');
  expect(mockDTier.id).toBe('tier-d');
  expect(mockBank.id).toBe('bank');
});

test('Entries are only saved when all entries are assigned a tier', async () => {
  await act(() => render(element));

  const contestCards = screen.getAllByTestId('voting-item');
  const mockSContainer = screen.getAllByTestId('voting-item-container')[0];
  expect(contestCards).toHaveLength(3);

  // simulate incomplete assignment of tiers
  fireEvent.dragStart(contestCards[0], { dataTransfer: { effectAllowed: 'none' } });
  fireEvent.drop(mockSContainer);
  fireEvent.dragEnd(contestCards[0]);
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  fireEvent.dragStart(contestCards[1], { dataTransfer: { effectAllowed: 'none' } });
  fireEvent.drop(mockSContainer);
  fireEvent.dragEnd(contestCards[1]);
  expect(mockedHandleSave).toHaveBeenCalledTimes(0);

  // simulate complete assignment of tiers
  fireEvent.dragStart(contestCards[2], { dataTransfer: { effectAllowed: 'none' } });
  fireEvent.drop(mockSContainer);
  fireEvent.dragEnd(contestCards[2]);
  expect(mockedHandleSave).toHaveBeenCalledTimes(1);
});
