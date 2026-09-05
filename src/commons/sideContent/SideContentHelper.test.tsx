import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { CONDUCTOR_STEPPER_TAB_ID } from 'src/features/conductor/stepperTab';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { useSideContent } from './SideContentHelper';
import { type SideContentTabId, SideContentType } from './SideContentTypes';

const renderUseSideContent = (selectedTab: SideContentTabId) => {
  const store = createMockStore<OverallState>()({
    sideContent: {
      playground: {
        alerts: [],
        dynamicTabs: [],
        selectedTab,
      },
    },
  } as unknown as OverallState);
  const hook = renderHook(() => useSideContent('playground'), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return { hook, store };
};

describe('useSideContent', () => {
  test('keeps the conductor Stepper selected when mobile Run is pressed', () => {
    const { hook, store } = renderUseSideContent(CONDUCTOR_STEPPER_TAB_ID);

    act(() => hook.result.current.setSelectedTab(SideContentType.mobileEditorRun));

    expect(store.getActions()).toEqual([]);
  });

  test('selects mobile Run from a regular tab', () => {
    const { hook, store } = renderUseSideContent(SideContentType.mobileEditor);

    act(() => hook.result.current.setSelectedTab(SideContentType.mobileEditorRun));

    expect(store.getActions()).toEqual([
      expect.objectContaining({
        payload: expect.objectContaining({ newId: SideContentType.mobileEditorRun }),
      }),
    ]);
  });
});
