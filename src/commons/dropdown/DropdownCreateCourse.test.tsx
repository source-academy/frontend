import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, type RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import { beforeEach, expect, test, vi } from 'vitest';

import DropdownCreateCourse from './DropdownCreateCourse';

const dispatchMock = vi.fn();
vi.mock('src/commons/utils/Hooks', async importOriginal => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAppDispatch: () => dispatchMock,
  };
});

const createRealStore = () =>
  configureStore({
    reducer: { session: (state = {}) => state },
  });

const getElement = (store: ReturnType<typeof createRealStore>) => (
  <Provider store={store}>
    <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, vi.fn()]}>
      <MemoryRouter>
        <DropdownCreateCourse isOpen onClose={vi.fn()} />
      </MemoryRouter>
    </WorkspaceSettingsContext.Provider>
  </Provider>
);

const typeIntoApiKey = (mounted: RenderResult, value: string) => {
  const apiKeyInput = mounted.baseElement.querySelector<HTMLInputElement>('#llmApiKey');
  if (!apiKeyInput) {
    throw new Error('LLM API key input not found');
  }
  fireEvent.change(apiKeyInput, { target: { value } });
};

const toggleLlmGrading = (mounted: RenderResult) => {
  const llmSwitch = mounted.getByLabelText('Enable LLM Grading');
  fireEvent.click(llmSwitch);
};

const fillCourseName = (mounted: RenderResult) => {
  const input = mounted.baseElement.querySelector<HTMLInputElement>('#courseName');
  if (!input) {
    throw new Error('Course name input not found');
  }
  fireEvent.change(input, { target: { value: 'CS1010S' } });
};

const clickCreateCourse = (mounted: RenderResult) => {
  fireEvent.click(mounted.getByRole('button', { name: 'Create Course' }));
};

const findCreateCourseActionPayload = () => {
  // `createActions` returns standard RTK actions with `type` + `payload`.
  const action = dispatchMock.mock.calls
    .map(call => call[0])
    .find((call): call is { type: string; payload: any } => Boolean(call && (call as any).type));
  if (!action) {
    throw new Error('createCourse action was not dispatched');
  }
  return action.payload as { llmApiKey?: string; enableLlmGrading?: boolean };
};

const setup = () => {
  const store = createRealStore();
  const mounted = render(getElement(store));
  // The component short-circuits if courseName is empty.
  fillCourseName(mounted);
  return mounted;
};

beforeEach(() => {
  dispatchMock.mockClear();
});

test('omits llmApiKey from the dispatched payload when LLM grading is disabled', () => {
  const mounted = setup();

  // Enable LLM grading so the API key input is rendered, then enter a key.
  toggleLlmGrading(mounted);
  typeIntoApiKey(mounted, 'sk-test-1234');
  // Now disable LLM grading and submit.
  toggleLlmGrading(mounted);
  clickCreateCourse(mounted);

  const payload = findCreateCourseActionPayload();
  expect(payload.llmApiKey).toBeUndefined();
  expect(payload.enableLlmGrading).toBe(false);
});

test('includes llmApiKey in the dispatched payload when LLM grading is enabled', () => {
  const mounted = setup();

  // Enable LLM grading so the API key input is rendered, then enter a key.
  toggleLlmGrading(mounted);
  typeIntoApiKey(mounted, 'sk-test-5678');
  clickCreateCourse(mounted);

  const payload = findCreateCourseActionPayload();
  expect(payload.llmApiKey).toBe('sk-test-5678');
  expect(payload.enableLlmGrading).toBe(true);
});
