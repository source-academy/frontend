import type { ITabService, Tab } from '@sourceacademy/common-tabs';

import { store } from '../../pages/createStore';
import { visitSideContent } from './SideContentActions';
import { type SideContentLocation, type SideContentTab, SideContentType } from './SideContentTypes';

type Listener = () => void;

type RegisteredTab = {
  tab: SideContentTab;
  visible: boolean;
};

export class TabService implements ITabService {
  private readonly emptyTabs: SideContentTab[] = [];
  private readonly listeners = new Set<Listener>();
  private readonly tabs = new Map<string, RegisteredTab>();
  private visibleTabs: SideContentTab[] = [];
  private workspaceLocation: SideContentLocation = 'playground';

  registerTab(tab: Tab): void {
    const currentTab = this.tabs.get(tab.id);
    this.tabs.set(tab.id, {
      tab,
      visible: currentTab?.visible ?? false,
    });
    this.emit();
  }

  unregisterTab(id: string): void {
    if (!this.tabs.delete(id)) {
      return;
    }
    this.emit();
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

  hideTab(id: string): void {
    this.setTabVisibility(id, false);
  }

  clearTabs(): void {
    if (this.tabs.size === 0) {
      return;
    }
    this.tabs.clear();
    this.emit();
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

export default sideContentManager;
