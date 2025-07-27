import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { Provider, useDispatch } from 'react-redux';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { Mock, vi } from 'vitest';

import ResearchAgreementPrompt from '../ResearchAgreementPrompt';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn()
}));
const useDispatchMock = useDispatch as Mock;
const dispatchMock = vi.fn();

const createElement = () => {
  const mockStore = mockInitialStore();
  const element = (
    <Provider store={mockStore}>
      <ResearchAgreementPrompt />
    </Provider>
  );

  return element;
};

describe('ResearchAgreementPrompt', () => {
  let user: UserEvent;

  beforeEach(() => {
    useDispatchMock.mockReturnValue(dispatchMock);
    dispatchMock.mockClear();
    user = userEvent.setup();
  });

  test('"I would like to opt out" dispatches correctly', async () => {
    render(createElement());
    const button = await screen.findByText('I would like to opt out');
    await user.click(button);

    expect(dispatchMock).toBeCalledTimes(1);
    expect(dispatchMock).toBeCalledWith(SessionActions.updateCourseResearchAgreement(false));
  });

  test('"I consent!" dispatches correctly', async () => {
    render(createElement());
    const button = await screen.findByText('I consent!');
    await user.click(button);

    expect(dispatchMock).toBeCalledTimes(1);
    expect(dispatchMock).toBeCalledWith(SessionActions.updateCourseResearchAgreement(true));
  });
});
