import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MissionMetadata from '../../githubAssessments/MissionMetadata';
import SideContentMissionEditor from '../SideContentMissionEditor';

test('typing into SideContentMissionEditor text boxes triggers setter function', () => {
  const missionMetadata = {
    coverImage: 'dummyCoverImage',
    kind: 'dummyKind',
    number: 'dummyNumber',
    title: 'dummyTitle',
    sourceVersion: 1,
    dueDate: new Date(),

    reading: 'dummyReading',
    webSummary: 'dummySummary'
  } as MissionMetadata;

  let outsideValue = Object.assign({}, missionMetadata);

  const setMissionMetadata = jest.fn((insideValue: MissionMetadata) => {
    outsideValue = insideValue;
  });

  act(() => {
    render(
      <SideContentMissionEditor
        missionMetadata={missionMetadata}
        setMissionMetadata={setMissionMetadata}
      />
    );
  });

  const coverImageText = screen.getByDisplayValue('dummyCoverImage');
  userEvent.clear(coverImageText);
  userEvent.type(coverImageText, 'realCoverImage');
  expect(outsideValue.coverImage).toBe('realCoverImage');

  const kindText = screen.getByDisplayValue('dummyKind');
  userEvent.clear(kindText);
  userEvent.type(kindText, 'realKind');
  expect(outsideValue.kind).toBe('realKind');

  const numberText = screen.getByDisplayValue('dummyNumber');
  userEvent.clear(numberText);
  userEvent.type(numberText, 'realNumber');
  expect(outsideValue.number).toBe('realNumber');

  const titleText = screen.getByDisplayValue('dummyTitle');
  userEvent.clear(titleText);
  userEvent.type(titleText, 'realTitle');
  expect(outsideValue.title).toBe('realTitle');

  const readingText = screen.getByDisplayValue('dummyReading');
  userEvent.clear(readingText);
  userEvent.type(readingText, 'realReading');
  expect(outsideValue.reading).toBe('realReading');

  const summaryText = screen.getByDisplayValue('dummySummary');
  userEvent.clear(summaryText);
  userEvent.type(summaryText, 'realSummary');
  expect(outsideValue.webSummary).toBe('realSummary');
});
