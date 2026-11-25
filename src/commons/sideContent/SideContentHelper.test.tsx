import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { combineAllTabs, useSideContent } from './SideContentHelper';
import { type SideContentTab, type SideContentTabId, SideContentType } from './SideContentTypes';

// Plugins in the plugin directory whose tab hides the REPL (like the Stepper's) and one whose does not.
const pluginMap = {
  hiding: {
    id: 'hiding',
    name: 'Hiding',
    resolutions: {},
    tab: { id: 'hiding-tab', label: 'Hiding', iconName: 'flow-review', hidesRepl: true },
  },
  showing: {
    id: 'showing',
    name: 'Showing',
    resolutions: {},
    tab: { id: 'showing-tab', label: 'Showing', iconName: 'eye-open' },
  },
};

const renderUseSideContent = (selectedTab: SideContentTabId) => {
  const store = createMockStore<OverallState>()({
    pluginDirectory: { plugins: Object.values(pluginMap), pluginMap },
    sideContent: {
      playground: {
        alerts: [],
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
  test('keeps a tab that hides the REPL selected when mobile Run is pressed', () => {
    const { hook, store } = renderUseSideContent('hiding-tab');

    act(() => hook.result.current.setSelectedTab(SideContentType.mobileEditorRun));

    expect(store.getActions()).toEqual([]);
  });

  test('selects mobile Run from a plugin tab that does not hide the REPL', () => {
    const { hook, store } = renderUseSideContent('showing-tab');

    act(() => hook.result.current.setSelectedTab(SideContentType.mobileEditorRun));

    expect(store.getActions()).toHaveLength(1);
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
    const livePluginTab = makeTab('showing-tab', 'Live plugin tab');

    const tabs = combineAllTabs(
      {
        leadingTabs: [makeTab(SideContentType.introduction)],
        trailingTabs: [makeTab(SideContentType.cseMachine), makeTab('showing-tab')],
      },
      [makeTab('data-visualizer'), livePluginTab],
    );

    expect(tabs.map(tab => tab.id)).toEqual([
      SideContentType.introduction,
      'data-visualizer',
      SideContentType.cseMachine,
      'showing-tab',
    ]);
    expect(tabs.at(-1)).toBe(livePluginTab);
  });
});
