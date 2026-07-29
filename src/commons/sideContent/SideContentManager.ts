import type { ITabService, Tab } from '@sourceacademy/common-tabs';
import { useCallback, useSyncExternalStore } from 'react';

import { store } from '../../pages/createStore';
import { visitSideContent } from './SideContentActions';
import { type SideContentLocation, type SideContentTab, SideContentType } from './SideContentTypes';

type Listener = () => void;

type RegisteredTab = {
  tab: SideContentTab;
  visible: boolean;
};

export type TabOwner = { readonly evaluatorPath: string };

export class TabService implements ITabService {
  private readonly emptyTabs: SideContentTab[] = [];
  private readonly listeners = new Set<Listener>();
  private readonly tabs = new Map<string, RegisteredTab>();
  private readonly tabOwners = new Map<string, TabOwner>();
  private visibleTabs: SideContentTab[] = [];
  private workspaceLocation: SideContentLocation = 'playground';

  registerTab(tab: Tab, owner?: TabOwner): void {
    const currentTab = this.tabs.get(tab.id);
    this.tabs.set(tab.id, {
      tab,
      visible: currentTab?.visible ?? false,
    });
    if (owner) {
      this.tabOwners.set(tab.id, owner);
    } else {
      this.tabOwners.delete(tab.id);
    }
    this.emit();
  }

  unregisterTab(id: string, owner?: TabOwner): void {
    // Only the current owner can remove a tab - a superseded conductor releasing itself must not
    // rip out a tab that's since been re-registered by whoever replaced it.
    if (owner && this.tabOwners.get(id) !== owner) {
      return;
    }
    this.tabOwners.delete(id);
    if (!this.tabs.delete(id)) {
      return;
    }
    this.emit();
  }

  getTabOwnerPath(id: string): string | undefined {
    return this.tabOwners.get(id)?.evaluatorPath;
  }

  showTab(id: string): void {
    this.setTabVisibility(id, true);
    // A module deciding to show its tab (e.g. the moment it starts using the host, like sound's
    // play()/record()) means it wants the student looking at it right now - but only if they're
    // still on the workspace's home tab (undefined selectedTab means no explicit navigation has
    // happened yet, i.e. still showing whatever default the caller's useSideContent() falls back
    // to). If the student has deliberately navigated to some other tab (including a previously
    // auto-shown one), a new module claiming the host shouldn't yank them away from it.
    const previousSelectedTab = store.getState().sideContent[this.workspaceLocation]?.selectedTab;
    if (previousSelectedTab !== undefined && previousSelectedTab !== SideContentType.introduction) {
      return;
    }
    store.dispatch(visitSideContent(id, previousSelectedTab, this.workspaceLocation));
  }

  revealTab(id: string): void {
    this.setTabVisibility(id, true);
  }

  hideTab(id: string): void {
    this.setTabVisibility(id, false);
  }

  getTabs(workspaceLocation: SideContentLocation): SideContentTab[] {
    if (workspaceLocation !== this.workspaceLocation) {
      return this.emptyTabs;
    }
    return this.visibleTabs;
  }

  setWorkspaceLocation(workspaceLocation: SideContentLocation): void {
    if (this.workspaceLocation === workspaceLocation) {
      return;
    }
    this.workspaceLocation = workspaceLocation;
    this.emit();
  }

  // An arrow-function property (not a method) so it has a stable `this`-bound identity that can be
  // passed directly to useSyncExternalStore - a plain method would need `.bind()` on every render
  // (a new function reference each time), causing needless unsubscribe/resubscribe churn.
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    this.visibleTabs = Array.from(this.tabs.values())
      .filter(({ visible }) => visible)
      .map(({ tab }) => tab);
    this.listeners.forEach(listener => listener());
  }

  private setTabVisibility(id: string, visible: boolean): void {
    const currentTab = this.tabs.get(id);
    if (!currentTab || currentTab.visible === visible) {
      return;
    }
    this.tabs.set(id, {
      ...currentTab,
      visible,
    });
    this.emit();
  }
}

const sideContentManager = new TabService();

/**
 * The evaluator path that registered `tabId`, or undefined if it has no tracked owner (not a
 * conductor-produced tab, or not currently registered) - drives generic tab-ownership UI like
 * locking the evaluator dropdown to whichever evaluator produced the selected tab.
 */
export function useTabOwnerPath(tabId: string | undefined): string | undefined {
  const getSnapshot = useCallback(
    () => (tabId === undefined ? undefined : sideContentManager.getTabOwnerPath(tabId)),
    [tabId],
  );
  return useSyncExternalStore(sideContentManager.subscribe, getSnapshot);
}

export default sideContentManager;
