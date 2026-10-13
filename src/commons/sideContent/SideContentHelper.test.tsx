import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import {
  CONDUCTOR_E_STEPPER_TAB_ID,
  CONDUCTOR_STEPPER_TAB_ID,
} from 'src/features/conductor/stepperTab';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { combineAllTabs, useSideContent } from './SideContentHelper';
import { type SideContentTab, type SideContentTabId, SideContentType } from './SideContentTypes';

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

  test('keeps the conductor E-Stepper selected when mobile Run is pressed', () => {
    const { hook, store } = renderUseSideContent(CONDUCTOR_E_STEPPER_TAB_ID);

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

describe('combineAllTabs', () => {
  const makeTab = (id: string, label = id): SideContentTab => ({
    id,
    label,
    iconName: 'home',
    body: null,
  });

  test('puts a service tab in the slot of the predefined tab sharing its id', () => {
    const liveEStepperTab = makeTab(CONDUCTOR_E_STEPPER_TAB_ID, 'Live E-Stepper');

    const tabs = combineAllTabs(
      {
        beforeDynamicTabs: [makeTab(SideContentType.introduction)],
        afterDynamicTabs: [
          makeTab(SideContentType.cseMachine),
          makeTab(CONDUCTOR_E_STEPPER_TAB_ID),
        ],
      },
      [],
      [makeTab('data-visualizer'), liveEStepperTab],
    );

    expect(tabs.map(tab => tab.id)).toEqual([
      SideContentType.introduction,
      'data-visualizer',
      SideContentType.cseMachine,
      CONDUCTOR_E_STEPPER_TAB_ID,
    ]);
    expect(tabs.at(-1)).toBe(liveEStepperTab);
  });
});
